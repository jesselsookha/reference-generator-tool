// State management
let references = [];
let showHints = true;
let currentType = null;
let editingIndex = null;

// Form templates for all reference types
const formTemplates = {
    'book-one': {
        title: 'Book (One Author)',
        info: 'For a book written by a single author.',
        fields: [
            { name: 'surname', label: 'Author Surname', required: true, hint: 'e.g., Hüther' },
            { name: 'initials', label: 'Author Initials', required: true, hint: 'e.g., G.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2006', tooltip: 'Use [s.a.] if year unavailable' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., The compassionate brain: How empathy creates intelligence' },
            { name: 'edition', label: 'Edition', required: false, hint: 'e.g., 2 (only if not first edition)' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Boston', tooltip: 'Use [s.l.] if place unavailable' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Trumpeter', tooltip: 'Use [s.n.] if publisher unavailable' }
        ],
        format: (data) => {
            const edition = data.edition ? `${data.edition}<sup>${getOrdinal(data.edition)}</sup> ed. ` : '';
            return `${data.surname}, ${data.initials}, ${data.year}. <em>${data.title}</em>. ${edition}${data.city}: ${data.publisher}.`;
        }
    },
    'book-multiple': {
        title: 'Book (2-3 Authors)',
        info: 'For a book written by two or three authors.',
        fields: [
            { name: 'author1_surname', label: 'First Author Surname', required: true, hint: 'e.g., Strunk' },
            { name: 'author1_initials', label: 'First Author Initials', required: true, hint: 'e.g., W.' },
            { name: 'author2_surname', label: 'Second Author Surname', required: true, hint: 'e.g., White' },
            { name: 'author2_initials', label: 'Second Author Initials', required: true, hint: 'e.g., E.B.' },
            { name: 'author3_surname', label: 'Third Author Surname', required: false, hint: 'Leave blank if only 2 authors' },
            { name: 'author3_initials', label: 'Third Author Initials', required: false, hint: 'Leave blank if only 2 authors' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2023' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., The elements of style' },
            { name: 'edition', label: 'Edition', required: false, hint: 'e.g., 4' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Massachusetts' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Allan and Bacon' }
        ],
        format: (data) => {
            let authors = `${data.author1_surname}, ${data.author1_initials} and ${data.author2_surname}, ${data.author2_initials}`;
            if (data.author3_surname && data.author3_initials) {
                authors += ` and ${data.author3_surname}, ${data.author3_initials}`;
            }
            const edition = data.edition ? `${data.edition}<sup>${getOrdinal(data.edition)}</sup> ed. ` : '';
            return `${authors}, ${data.year}. <em>${data.title}</em>. ${edition}${data.city}: ${data.publisher}.`;
        }
    },
    'book-four-plus': {
        title: 'Book (4+ Authors)',
        info: 'For a book written by four or more authors (use et al. in citations).',
        fields: [
            { name: 'author1_surname', label: 'First Author Surname', required: true, hint: 'e.g., Green' },
            { name: 'author1_initials', label: 'First Author Initials', required: true, hint: 'e.g., G.' },
            { name: 'author2_surname', label: 'Second Author Surname', required: true, hint: 'e.g., Pecar' },
            { name: 'author2_initials', label: 'Second Author Initials', required: true, hint: 'e.g., B.' },
            { name: 'author3_surname', label: 'Third Author Surname', required: true, hint: 'e.g., Santana' },
            { name: 'author3_initials', label: 'Third Author Initials', required: true, hint: 'e.g., L.' },
            { name: 'author4_surname', label: 'Fourth Author Surname', required: true, hint: 'e.g., Burke' },
            { name: 'author4_initials', label: 'Fourth Author Initials', required: true, hint: 'e.g., A.' },
            { name: 'additional_authors', label: 'Additional Authors', required: false, hint: 'If more than 4, format: Surname, Initials and Surname, Initials' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2014' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., Statistics for the social sciences' },
            { name: 'edition', label: 'Edition', required: false, hint: 'e.g., 2' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Cape Town' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Oxford University Press' }
        ],
        format: (data) => {
            let authors = `${data.author1_surname}, ${data.author1_initials}, ${data.author2_surname}, ${data.author2_initials}, ${data.author3_surname}, ${data.author3_initials} and ${data.author4_surname}, ${data.author4_initials}`;
            if (data.additional_authors) {
                authors += `, ${data.additional_authors}`;
            }
            const edition = data.edition ? `${data.edition}<sup>${getOrdinal(data.edition)}</sup> ed. ` : '';
            return `${authors}, ${data.year}. <em>${data.title}</em>. ${edition}${data.city}: ${data.publisher}.`;
        }
    },
    'book-same-author': {
        title: 'Books (Same Author, Multiple Publications)',
        info: 'For multiple works by the same author. Use letters (a, b, c) for same year publications.',
        fields: [
            { name: 'surname', label: 'Author Surname', required: true, hint: 'e.g., Smith' },
            { name: 'initials', label: 'Author Initials', required: true, hint: 'e.g., R.G.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2015' },
            { name: 'year_letter', label: 'Year Letter', required: false, hint: 'e.g., a (for 2015a, 2015b). Leave blank if not needed' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., Changing policy paradigms' },
            { name: 'edition', label: 'Edition', required: false, hint: 'e.g., 2' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Cape Town' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Education House' }
        ],
        format: (data) => {
            const year = data.year_letter ? `${data.year}${data.year_letter}` : data.year;
            const edition = data.edition ? `${data.edition}<sup>${getOrdinal(data.edition)}</sup> ed. ` : '';
            return `${data.surname}, ${data.initials}, ${year}. <em>${data.title}</em>. ${edition}${data.city}: ${data.publisher}.`;
        }
    },
    'book-editor': {
        title: 'Book (Editor/s)',
        info: 'For a book with editor(s) rather than author(s).',
        fields: [
            { name: 'editor1_surname', label: 'First Editor Surname', required: true, hint: 'e.g., Loubser' },
            { name: 'editor1_initials', label: 'First Editor Initials', required: true, hint: 'e.g., C.P.' },
            { name: 'editor2_surname', label: 'Second Editor Surname', required: false, hint: 'Leave blank if only one editor' },
            { name: 'editor2_initials', label: 'Second Editor Initials', required: false, hint: 'Leave blank if only one editor' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2005' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., Environmental education: Some South African perspectives' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Pretoria' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Van Schaik' }
        ],
        format: (data) => {
            let editors;
            if (data.editor2_surname && data.editor2_initials) {
                editors = `${data.editor1_surname}, ${data.editor1_initials} and ${data.editor2_surname}, ${data.editor2_initials} eds.`;
            } else {
                editors = `${data.editor1_surname}, ${data.editor1_initials} ed.`;
            }
            return `${editors}, ${data.year}. <em>${data.title}</em>. ${data.city}: ${data.publisher}.`;
        }
    },
    'chapter': {
        title: 'Chapter from Edited Book',
        info: 'For a chapter within an edited book.',
        fields: [
            { name: 'chapter_author_surname', label: 'Chapter Author Surname', required: true, hint: 'e.g., Davis' },
            { name: 'chapter_author_initials', label: 'Chapter Author Initials', required: true, hint: 'e.g., C.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2014' },
            { name: 'chapter_title', label: 'Chapter Title', required: true, hint: 'e.g., The aims of research' },
            { name: 'editor_initials', label: 'Editor Initials', required: true, hint: 'e.g., F.' },
            { name: 'editor_surname', label: 'Editor Surname', required: true, hint: 'e.g., du Plooy-Cilliers' },
            { name: 'additional_editors', label: 'Additional Editors', required: false, hint: 'e.g., C. Davis and R.M. Bezuidenhout' },
            { name: 'book_title', label: 'Book Title', required: true, hint: 'e.g., Research matters' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Claremont' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Juta' },
            { name: 'chapter_number', label: 'Chapter Number', required: false, hint: 'e.g., 5' },
            { name: 'pages', label: 'Page Numbers', required: true, hint: 'e.g., 72-81' }
        ],
        format: (data) => {
            const editors = data.additional_editors 
                ? `${data.editor_initials} ${data.editor_surname}, ${data.additional_editors}, eds.`
                : `${data.editor_initials} ${data.editor_surname}, ed.`;
            const chapter = data.chapter_number ? `Chapter ${data.chapter_number}: ` : '';
            return `${data.chapter_author_surname}, ${data.chapter_author_initials}, ${data.year}. ${data.chapter_title}. In: ${editors} <em>${data.book_title}</em>. ${data.city}: ${data.publisher}, ${chapter}pp.${data.pages}.`;
        }
    },
    'ebook': {
        title: 'eBook',
        info: 'For an electronic book accessed online.',
        fields: [
            { name: 'surname', label: 'Author Surname', required: true, hint: 'e.g., Cox' },
            { name: 'initials', label: 'Author Initials', required: true, hint: 'e.g., A.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2008' },
            { name: 'title', label: 'Book Title', required: true, hint: 'e.g., The short story' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Newcastle' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Cambridge Scholars Publishing' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the permalink' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 31 October 2017' }
        ],
        format: (data) => {
            return `${data.surname}, ${data.initials}, ${data.year}. ${data.title}. [e-book] ${data.city}: ${data.publisher}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'pdf': {
        title: 'PDF Document',
        info: 'For a PDF document accessed online.',
        fields: [
            { name: 'author', label: 'Author/Organization', required: true, hint: 'e.g., Bank of England' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2008' },
            { name: 'title', label: 'Document Title', required: true, hint: 'e.g., Inflation Report' },
            { name: 'city', label: 'City of Publication', required: false, hint: 'e.g., London (use [s.l.] if unknown)' },
            { name: 'publisher', label: 'Publisher', required: false, hint: 'e.g., Bank of England' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the PDF URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 20 April 2009' }
        ],
        format: (data) => {
            const city = data.city || '[s.l.]';
            const publisher = data.publisher || data.author;
            return `${data.author}, ${data.year}. ${data.title}. [pdf] ${city}: ${publisher}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'poem': {
        title: 'Poem (from book/website)',
        info: 'For a poem from a book or website.',
        fields: [
            { name: 'poet_surname', label: 'Poet Surname', required: true, hint: 'e.g., Mhlophe' },
            { name: 'poet_initials', label: 'Poet Initials', required: true, hint: 'e.g., G.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2013' },
            { name: 'poem_title', label: 'Poem Title', required: true, hint: 'e.g., Say no' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['book', 'website'], hint: 'Select if from book or website' },
            { name: 'book_editor', label: 'Book Editor', required: false, hint: 'e.g., H. Moffett (only if from book)' },
            { name: 'book_title', label: 'Book Title', required: false, hint: 'e.g., Seasons come to pass (only if from book)' },
            { name: 'city', label: 'City', required: false, hint: 'e.g., Cape Town (only if from book)' },
            { name: 'publisher', label: 'Publisher', required: false, hint: 'e.g., Oxford University Press (only if from book)' },
            { name: 'pages', label: 'Pages', required: false, hint: 'e.g., 271-272 (only if from book)' },
            { name: 'url', label: 'URL', required: false, hint: 'Only if from website' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 09 February 2018 (only if from website)' }
        ],
        format: (data) => {
            if (data.source_type === 'book') {
                return `${data.poet_surname}, ${data.poet_initials}, ${data.year}. ${data.poem_title}. In: ${data.book_editor}, <em>${data.book_title}</em>. ${data.city}: ${data.publisher}, pp.${data.pages}.`;
            } else {
                return `${data.poet_surname}, ${data.poet_initials}, ${data.year}. ${data.poem_title}. [online poem]. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            }
        }
    },
    'journal': {
        title: 'Journal Article',
        info: 'For a printed journal article.',
        fields: [
            { name: 'surname', label: 'Author Surname', required: true, hint: 'e.g., Spaull' },
            { name: 'initials', label: 'Author Initials', required: true, hint: 'e.g., N.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2013' },
            { name: 'article_title', label: 'Article Title', required: true, hint: 'e.g., Poverty and privilege: Primary school inequality' },
            { name: 'journal_title', label: 'Journal Title', required: true, hint: 'e.g., International Journal of Educational Development' },
            { name: 'volume', label: 'Volume', required: true, hint: 'e.g., 33' },
            { name: 'issue', label: 'Issue', required: true, hint: 'e.g., 2' },
            { name: 'pages', label: 'Page Numbers', required: true, hint: 'e.g., 436-447' }
        ],
        format: (data) => {
            return `${data.surname}, ${data.initials}, ${data.year}. ${data.article_title}. <em>${data.journal_title}</em>, ${data.volume}(${data.issue}), pp.${data.pages}.`;
        }
    },
    'journal-online': {
        title: 'Journal Article (Online)',
        info: 'For a journal article obtained from an online database.',
        fields: [
            { name: 'surname', label: 'Author Surname', required: true, hint: 'e.g., Barker' },
            { name: 'initials', label: 'Author Initials', required: true, hint: 'e.g., R.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2009' },
            { name: 'article_title', label: 'Article Title', required: true, hint: 'e.g., A qualitative thematic analysis' },
            { name: 'journal_title', label: 'Journal Title', required: true, hint: 'e.g., Journal of Qualitative Research' },
            { name: 'volume', label: 'Volume', required: true, hint: 'e.g., 42' },
            { name: 'issue', label: 'Issue', required: true, hint: 'e.g., 1' },
            { name: 'pages', label: 'Page Numbers', required: true, hint: 'e.g., 7-14' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the permalink/DOI URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 22 July 2023' }
        ],
        format: (data) => {
            return `${data.surname}, ${data.initials}, ${data.year}. ${data.article_title}. <em>${data.journal_title}</em>, [e-journal] ${data.volume}(${data.issue}), pp.${data.pages}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    }, 
    // Continuing formTemplates object with remaining reference types...
    'newspaper': {
        title: 'Newspaper/Magazine Article',
        info: 'For printed or online newspaper/magazine articles.',
        fields: [
            { name: 'author_surname', label: 'Author Surname', required: false, hint: 'e.g., Du Preez (leave blank if no author)' },
            { name: 'author_initials', label: 'Author Initials', required: false, hint: 'e.g., S.P.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2014' },
            { name: 'article_title', label: 'Article Title', required: true, hint: 'e.g., Smarter than he looks' },
            { name: 'publication', label: 'Publication Name', required: true, hint: 'e.g., Politics Today or Daily Maverick' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['printed', 'online'], hint: 'Is this printed or online?' },
            { name: 'date', label: 'Publication Date', required: true, hint: 'e.g., 4 October or 18 November' },
            { name: 'page', label: 'Page', required: false, hint: 'e.g., 4 (only for printed articles)' },
            { name: 'url', label: 'URL', required: false, hint: 'Only for online articles' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 19 November 2015 (only for online)' }
        ],
        format: (data) => {
            const author = data.author_surname ? `${data.author_surname}, ${data.author_initials}` : data.publication;
            
            if (data.source_type === 'printed') {
                const page = data.page ? ` p.${data.page}` : '';
                return `${author}, ${data.year}. ${data.article_title}. <em>${data.publication}</em>, ${data.date}.${page}.`;
            } else {
                return `${author}, ${data.year}. ${data.article_title}. <em>${data.publication}</em>, [online] ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            }
        }
    },
    'website': {
        title: 'Website',
        info: 'For content from a website.',
        fields: [
            { name: 'author', label: 'Author/Organization', required: true, hint: 'e.g., World Health Organisation' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2015' },
            { name: 'title', label: 'Page Title', required: true, hint: 'e.g., WHO calls on countries to protect health' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the full URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 20 November 2015' }
        ],
        format: (data) => {
            return `${data.author}, ${data.year}. ${data.title}. [online] Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'youtube': {
        title: 'YouTube/TEDx Video',
        info: 'For videos from YouTube, TEDx, or similar platforms.',
        fields: [
            { name: 'author', label: 'Author/Channel Name', required: true, hint: 'e.g., Department for Environment, Food and Rural Affairs' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2007' },
            { name: 'title', label: 'Video Title', required: true, hint: 'e.g., Sustainable development: the bigger picture' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the YouTube URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 23 June 2012' }
        ],
        format: (data) => {
            return `${data.author}, ${data.year}. ${data.title}. [video online] Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'blog': {
        title: 'Blog Article',
        info: 'For blog posts and articles.',
        fields: [
            { name: 'author', label: 'Author Name', required: true, hint: 'e.g., Geezer, D.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2009' },
            { name: 'title', label: 'Blog Post Title', required: true, hint: 'e.g., Conservationists are not making themselves heard' },
            { name: 'blog_name', label: 'Blog Name', required: true, hint: 'e.g., Guardian.co.uk Science blog' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., 18 June' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the blog post URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 23 June 2009' }
        ],
        format: (data) => {
            return `${data.author}, ${data.year}. ${data.title}. <em>${data.blog_name}</em>, [blog] ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'board-game': {
        title: 'Card/Board Game',
        info: 'For board games and card games.',
        fields: [
            { name: 'author', label: 'Author/Publisher', required: true, hint: 'e.g., Horton, M.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2019' },
            { name: 'title', label: 'Game Title', required: true, hint: "e.g., We're doomed! the game of global panic" },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Hillside, NY' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Breaking Games' }
        ],
        format: (data) => {
            return `${data.author}, ${data.year}. ${data.title} [board game]. ${data.city}: ${data.publisher}.`;
        }
    },
    'video-game': {
        title: 'Computer/Online Video Game',
        info: 'For computer and online video games.',
        fields: [
            { name: 'author', label: 'Author/Publisher', required: true, hint: 'e.g., Sony' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2017' },
            { name: 'title', label: 'Game Title', required: true, hint: 'e.g., Fortnite Battle Royale' },
            { name: 'platform', label: 'Platform', required: true, hint: 'e.g., PS4, PC, Xbox' },
            { name: 'city', label: 'City', required: true, hint: 'e.g., Poland' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., Gearbox' },
            { name: 'url', label: 'URL', required: true, hint: 'Game URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 23 March 2025' }
        ],
        format: (data) => {
            return `${data.author}, ${data.year}. ${data.title} [online digital game] ${data.platform}. ${data.city}: ${data.publisher}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'artwork': {
        title: 'Artwork/Image/Figure',
        info: 'For artworks, paintings, and physical images.',
        fields: [
            { name: 'artist_surname', label: 'Artist Surname', required: true, hint: 'e.g., Picasso' },
            { name: 'artist_initials', label: 'Artist Initials', required: true, hint: 'e.g., P.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 1907' },
            { name: 'title', label: 'Artwork Title', required: true, hint: "e.g., Les demoiselles d'Avignon" },
            { name: 'medium', label: 'Medium', required: true, hint: 'e.g., Oil on canvas' },
            { name: 'dimensions', label: 'Dimensions', required: false, hint: 'e.g., 243.9 x 233.9cm' },
            { name: 'location', label: 'Location', required: true, hint: 'e.g., Museum of Modern Art, New York' }
        ],
        format: (data) => {
            const dimensions = data.dimensions ? ` ${data.dimensions}.` : '.';
            return `${data.artist_surname}, ${data.artist_initials}, ${data.year}. ${data.title}. ${data.medium}.${dimensions} ${data.location}.`;
        }
    },
    'photograph': {
        title: 'Photograph',
        info: 'For photographs from books, collections, or online.',
        fields: [
            { name: 'photographer', label: 'Photographer Name', required: true, hint: 'e.g., Beaton, C.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 1956' },
            { name: 'title', label: 'Photo Title/Description', required: true, hint: 'e.g., Marilyn Monroe' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['physical', 'online'], hint: 'Physical collection or online?' },
            { name: 'collection', label: 'Collection Details', required: false, hint: "e.g., Marilyn Monroe's own private collection" },
            { name: 'url', label: 'URL', required: false, hint: 'Only if online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 18 June 2008 (only if online)' }
        ],
        format: (data) => {
            if (data.source_type === 'physical') {
                return `${data.photographer}, ${data.year}. ${data.title}. [photograph] (${data.collection}).`;
            } else {
                return `${data.photographer}, ${data.year}. ${data.title}. [electronic print] Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            }
        }
    },
    'online-image': {
        title: 'Online Image/Figure',
        info: 'For images and figures found online.',
        fields: [
            { name: 'creator', label: 'Creator/Author', required: false, hint: 'e.g., Khokhlov, A. (leave blank if unknown)' },
            { name: 'year', label: 'Year', required: false, hint: 'e.g., 2015 (use [s.a.] if unknown)' },
            { name: 'title', label: 'Image Title', required: true, hint: 'e.g., The Art of Face - Optical Illusion nr.13' },
            { name: 'url', label: 'URL', required: true, hint: 'Paste the image URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 18 June 2015' }
        ],
        format: (data) => {
            const creator = data.creator ? `${data.creator}, ` : '';
            const year = data.year || '[s.a.]';
            return `${creator}${year}. ${data.title}. [electronic print] Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'instagram': {
        title: 'Instagram Post',
        info: 'For Instagram posts.',
        fields: [
            { name: 'username', label: 'Username/Handle', required: true, hint: 'e.g., @helmafashionsa or Design Thinking Comic' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2020' },
            { name: 'title', label: 'Post Title/First Words', required: true, hint: 'First 20 words or description' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., 11 November' },
            { name: 'url', label: 'URL', required: true, hint: 'Instagram post URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 11 November 2010' }
        ],
        format: (data) => {
            return `${data.username}, ${data.year}. ${data.title} [Instagram]. ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'facebook': {
        title: 'Facebook Post',
        info: 'For Facebook posts.',
        fields: [
            { name: 'username', label: 'Username/Page Name', required: true, hint: 'e.g., @helmafashionsa' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2020' },
            { name: 'title', label: 'Post Title/First Words', required: true, hint: 'First 20 words or description' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., May 7' },
            { name: 'url', label: 'URL', required: true, hint: 'Facebook post URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 22 July 2021' }
        ],
        format: (data) => {
            return `${data.username}, ${data.year}. ${data.title}. [Facebook]. ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'x-post': {
        title: 'X (Twitter) Post',
        info: 'For posts on X (formerly Twitter).',
        fields: [
            { name: 'username', label: 'Username/Handle', required: true, hint: 'e.g., Pixels Graphic Design or @username' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2025' },
            { name: 'title', label: 'Post Title/First Words', required: true, hint: 'First 20 words or description' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., June 14' },
            { name: 'url', label: 'URL', required: true, hint: 'X post URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 07 February 2025' }
        ],
        format: (data) => {
            return `${data.username}, ${data.year}. ${data.title} [X]. ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'tiktok': {
        title: 'TikTok Post',
        info: 'For TikTok videos.',
        fields: [
            { name: 'username', label: 'Username/Creator', required: true, hint: 'e.g., Deliveroo' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2021' },
            { name: 'title', label: 'Video Title/Description', required: true, hint: 'First 20 words or description' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., 8 April' },
            { name: 'url', label: 'URL', required: true, hint: 'TikTok video URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 22 July 2021' }
        ],
        format: (data) => {
            return `${data.username}, ${data.year}. ${data.title}. [TikTok]. ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'film': {
        title: 'Film (Cinema/DVD/Video)',
        info: 'For films in various formats.',
        fields: [
            { name: 'title', label: 'Film Title', required: true, hint: 'e.g., The Great Gatsby' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2013' },
            { name: 'director', label: 'Director Name', required: true, hint: 'e.g., Baz Luhrmann' },
            { name: 'city', label: 'City/Country', required: true, hint: 'e.g., California' },
            { name: 'distributor', label: 'Distribution Company', required: true, hint: 'e.g., Warner Bros.' }
        ],
        format: (data) => {
            return `${data.title}, ${data.year}. [film] Directed by ${data.director}. ${data.city}: ${data.distributor}.`;
        }
    },
    'tv-series': {
        title: 'TV Series/Episode',
        info: 'For television series and specific episodes.',
        fields: [
            { name: 'series_title', label: 'Series Title', required: true, hint: 'e.g., Fringe' },
            { name: 'year', label: 'Year of Broadcast', required: true, hint: 'e.g., 2012' },
            { name: 'episode_title', label: 'Episode Title', required: true, hint: 'e.g., The bullet that saved the world' },
            { name: 'series_number', label: 'Series Number', required: true, hint: 'e.g., 5' },
            { name: 'episode_number', label: 'Episode Number', required: true, hint: 'e.g., 4' },
            { name: 'director', label: 'Director', required: true, hint: 'e.g., David Straiton' },
            { name: 'writer', label: 'Writer', required: true, hint: 'e.g., Alison Schapker' },
            { name: 'city', label: 'City', required: true, hint: 'e.g., California' },
            { name: 'broadcaster', label: 'Broadcasting Organization', required: true, hint: 'e.g., Fox' }
        ],
        format: (data) => {
            return `${data.series_title}, ${data.year}. ${data.episode_title}, Series ${data.series_number} episode ${data.episode_number}. Directed by ${data.director}. Written by ${data.writer}. [DVD]. First broadcast ${data.year}. ${data.city}: ${data.broadcaster}.`;
        }
    },
    'interview': {
        title: 'Interview/Personal Communication',
        info: 'For interviews and personal communications.',
        fields: [
            { name: 'interviewee_surname', label: 'Interviewee Surname', required: true, hint: 'e.g., Leon' },
            { name: 'interviewee_initials', label: 'Interviewee Initials', required: true, hint: 'e.g., S.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2013' },
            { name: 'title', label: 'Title/Position', required: true, hint: 'e.g., Political analyst, Institute for Security Studies' },
            { name: 'interviewer', label: 'Interviewer Name', required: true, hint: 'e.g., John Boyd' },
            { name: 'medium', label: 'Medium', required: true, type: 'select', options: ['Personal interview', 'Telephonic conversation', 'Email conversation', 'Radio', 'Forum message'], hint: 'Interview format' },
            { name: 'broadcaster', label: 'Broadcaster/Station', required: false, hint: 'e.g., Power FM (only for radio)' },
            { name: 'date', label: 'Interview Date', required: true, hint: 'e.g., 10 June 2013' },
            { name: 'time', label: 'Time', required: false, hint: 'e.g., 08:30 (only for radio)' }
        ],
        format: (data) => {
            let medium = `[${data.medium.toLowerCase()}]`;
            let broadcast = '';
            if (data.medium === 'Radio' && data.broadcaster) {
                broadcast = ` ${data.broadcaster},`;
                medium = '[radio]';
            }
            const time = data.time ? `, ${data.time}` : '';
            return `${data.interviewee_surname}, ${data.interviewee_initials}, ${data.year}. ${data.title}. Interviewed by ${data.interviewer}. ${medium}${broadcast} ${data.date}${time}.`;
        }
    },
    'conference': {
        title: 'Conference Proceedings',
        info: 'For conference papers and proceedings.',
        fields: [
            { name: 'author_surname', label: 'Author Surname', required: true, hint: 'e.g., Anderson' },
            { name: 'author_initials', label: 'Author Initials', required: true, hint: 'e.g., A.A.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2011' },
            { name: 'paper_title', label: 'Paper Title', required: true, hint: 'e.g., Public Relations challenges in emerging countries' },
            { name: 'conference_title', label: 'Conference Title', required: true, hint: 'e.g., Public Relations Possibilities Conference' },
            { name: 'location', label: 'Conference Location', required: true, hint: 'e.g., New York, United States of America' },
            { name: 'dates', label: 'Conference Dates', required: true, hint: 'e.g., 19-23 September 2011' },
            { name: 'city', label: 'Publication City', required: true, hint: 'e.g., New York, NY' },
            { name: 'organizer', label: 'Conference Organizer', required: true, hint: 'e.g., United Nations' }
        ],
        format: (data) => {
            return `${data.author_surname}, ${data.author_initials}, ${data.year}. ${data.paper_title}. <em>${data.conference_title}</em>. ${data.location}, ${data.dates}. ${data.city}: ${data.organizer}.`;
        }
    },
    'thesis': {
        title: 'Dissertation/Thesis',
        info: 'For unpublished dissertations and theses.',
        fields: [
            { name: 'author_surname', label: 'Author Surname', required: true, hint: 'e.g., Siewierski' },
            { name: 'author_initials', label: 'Author Initials', required: true, hint: 'e.g., C.L.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2015' },
            { name: 'title', label: 'Thesis Title', required: true, hint: 'e.g., What teachers think about teacher unions' },
            { name: 'qualification', label: 'Qualification', required: true, hint: 'e.g., MEd dissertation or PhD thesis' },
            { name: 'institution', label: 'Institution', required: true, hint: 'e.g., University of the Witwatersrand' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['physical', 'online'], hint: 'Physical or online version?' },
            { name: 'url', label: 'URL', required: false, hint: 'Only if online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 07 February 2025 (only if online)' }
        ],
        format: (data) => {
            if (data.source_type === 'online') {
                return `${data.author_surname}, ${data.author_initials}, ${data.year}. ${data.title}. ${data.qualification}. ${data.institution}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            } else {
                return `${data.author_surname}, ${data.author_initials}, ${data.year}. ${data.title}. ${data.qualification}. ${data.institution}.`;
            }
        }
    },
    'government': {
        title: 'Government Publication',
        info: 'For government documents and publications.',
        fields: [
            { name: 'department', label: 'Government Department', required: true, hint: 'e.g., Department of Basic Education' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2013' },
            { name: 'title', label: 'Document Title', required: true, hint: 'e.g., Dinaledi schools and the adopt-a-school programme' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., Pretoria' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'Usually the department name' }
        ],
        format: (data) => {
            return `${data.department}, ${data.year}. ${data.title}. ${data.city}: ${data.publisher}.`;
        }
    },
    'act': {
        title: 'Acts/Bills/White Papers',
        info: 'For government Acts, Bills, and policy papers.',
        fields: [
            { name: 'type', label: 'Document Type', required: true, type: 'select', options: ['Act', 'Bill', 'White Paper', 'Green Paper'], hint: 'Type of document' },
            { name: 'title', label: 'Title', required: true, hint: 'e.g., Higher Education Act or Labour Relations Amendment Bill' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2004' },
            { name: 'number', label: 'Number/Chapter', required: false, hint: 'e.g., c.8 or No. 77D of 2001' },
            { name: 'city', label: 'City of Publication', required: true, hint: 'e.g., London or Cape Town' },
            { name: 'publisher', label: 'Publisher', required: true, hint: 'e.g., HMSO or Government Printers' }
        ],
        format: (data) => {
            const number = data.number ? ` ${data.number}` : '';
            return `${data.title}${number}, ${data.year}. ${data.city}: ${data.publisher}.`;
        }
    },
    'dictionary': {
        title: 'Dictionary/Encyclopedia',
        info: 'For dictionaries and encyclopedias (print or online).',
        fields: [
            { name: 'publisher', label: 'Dictionary Publisher', required: true, hint: 'e.g., Oxford or Chambers' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2010' },
            { name: 'title', label: 'Dictionary Title', required: true, hint: 'e.g., Oxford English Dictionary' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['print', 'online'], hint: 'Print or online?' },
            { name: 'city', label: 'City of Publication', required: false, hint: 'e.g., Oxford (for print only)' },
            { name: 'publisher_name', label: 'Publisher Name', required: false, hint: 'e.g., Clarendon (for print only)' },
            { name: 'url', label: 'URL', required: false, hint: 'Only for online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 12 June 2011 (only for online)' }
        ],
        format: (data) => {
            if (data.source_type === 'print') {
                return `${data.publisher}, ${data.year}. <em>${data.title}</em>. ${data.city}: ${data.publisher_name}.`;
            } else {
                return `${data.publisher}, ${data.year}. <em>${data.title}</em>. [online] ${data.city}: ${data.publisher_name}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            }
        }
    },
    'module-guide': {
        title: 'Module Outline/Lecture Notes',
        info: 'For institutional module guides and lecture materials.',
        fields: [
            { name: 'institution', label: 'Institution', required: true, hint: 'e.g., The Independent Institute of Education' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2025' },
            // Continuing module-guide and adding remaining types...
            { name: 'module_title', label: 'Module Title', required: true, hint: 'e.g., Digital and academic literacies' },
            { name: 'module_code', label: 'Module Code', required: true, hint: 'e.g., DIAL5111' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['print', 'online'], hint: 'Print or online VLE?' },
            { name: 'url', label: 'URL', required: false, hint: 'Only if available online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 07 February 2025 (only if online)' }
        ],
        format: (data) => {
            if (data.source_type === 'online') {
                return `${data.institution}, ${data.year}. ${data.module_title} [${data.module_code}]. [online via internal VLE] ${data.institution}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            } else {
                return `${data.institution}, ${data.year}. ${data.module_title} [${data.module_code} Module Outline]. ${data.institution}: Unpublished.`;
            }
        }
    },
    'code': {
        title: 'Code Snippet/Computer Program',
        info: 'For code snippets and computer programs from the internet.',
        fields: [
            { name: 'author', label: 'Author/Company', required: true, hint: 'e.g., Smith, J. or company name' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2011' },
            { name: 'title', label: 'Program/Code Title', required: true, hint: 'e.g., Graphics Drawer source code' },
            { name: 'version', label: 'Version', required: false, hint: 'e.g., 2.0' },
            { name: 'url', label: 'URL', required: true, hint: 'Program or repository URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 10 May 2021' }
        ],
        format: (data) => {
            const version = data.version ? ` (Version ${data.version})` : '';
            return `${data.author}, ${data.year}. ${data.title}${version} [Source code]. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'app': {
        title: 'Mobile App',
        info: 'For mobile applications.',
        fields: [
            { name: 'developer', label: 'Developer/Company', required: true, hint: 'e.g., Skyscape' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2010 (use access year if unavailable)' },
            { name: 'title', label: 'App Title', required: true, hint: 'e.g., Skyscape medical resources' },
            { name: 'version', label: 'Version', required: false, hint: 'e.g., 1.9.11' },
            { name: 'source', label: 'App Source', required: true, type: 'select', options: ['URL', 'Google Play', 'Apple App Store'], hint: 'Where is the app available?' },
            { name: 'url', label: 'URL', required: false, hint: 'Only if source is URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 22 July 2021' }
        ],
        format: (data) => {
            const version = data.version ? ` Version ${data.version}.` : '';
            let source = '';
            if (data.source === 'URL') {
                source = `Available at: &lt;${data.url}&gt;`;
            } else {
                source = `Available from ${data.source}`;
            }
            return `${data.developer}, ${data.year}. ${data.title}.${version} [App]. ${source} [Accessed ${data.access_date}].`;
        }
    },
    'sound': {
        title: 'Sound Clip/Music',
        info: 'For sound recordings and music tracks.',
        fields: [
            { name: 'artist', label: 'Artist/Composer', required: true, hint: 'e.g., Lennon, J. and McCartney, P.' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 1966' },
            { name: 'title', label: 'Track Title', required: true, hint: 'e.g., Yellow submarine' },
            { name: 'album', label: 'Album Title', required: false, hint: 'e.g., Revolver' },
            { name: 'performer', label: 'Performer', required: false, hint: 'e.g., The Beatles (if different from artist)' },
            { name: 'city', label: 'City', required: true, hint: 'e.g., Hayes' },
            { name: 'label', label: 'Record Label', required: true, hint: 'e.g., EMI' },
            { name: 'source_type', label: 'Source Type', required: true, type: 'select', options: ['physical', 'online'], hint: 'Physical or online?' },
            { name: 'url', label: 'URL', required: false, hint: 'Only if online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'Only if online' }
        ],
        format: (data) => {
            const performer = data.performer ? ` Performed by ${data.performer}` : '';
            const album = data.album ? ` on the album ${data.album}` : '';
            
            if (data.source_type === 'online') {
                return `${data.artist}, ${data.year}. ${data.title}.${performer}${album}. [sound recording] ${data.city}: ${data.label}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            } else {
                return `${data.artist}, ${data.year}. ${data.title}.${performer}${album}. [sound recording] ${data.city}: ${data.label}.`;
            }
        }
    },
    'cd': {
        title: 'CD/Album',
        info: 'For complete CD albums.',
        fields: [
            { name: 'artist', label: 'Artist/Band Name', required: true, hint: 'e.g., Oasis' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 1994' },
            { name: 'title', label: 'Album Title', required: true, hint: 'e.g., Definitely maybe' },
            { name: 'city', label: 'City', required: true, hint: 'e.g., Manchester' },
            { name: 'label', label: 'Record Label', required: true, hint: 'e.g., Creation Records' }
        ],
        format: (data) => {
            return `${data.artist}, ${data.year}. <em>${data.title}</em>. [CD] ${data.city}: ${data.label}.`;
        }
    },
    'radio': {
        title: 'Radio Programme',
        info: 'For radio programmes and broadcasts.',
        fields: [
            { name: 'title', label: 'Programme Title', required: true, hint: 'e.g., The Sun' },
            { name: 'year', label: 'Year of Transmission', required: true, hint: 'e.g., 2015' },
            { name: 'station', label: 'Radio Station', required: true, hint: 'e.g., BBC Radio 4' },
            { name: 'date', label: 'Date of Transmission', required: true, hint: 'e.g., 1 January' },
            { name: 'url', label: 'URL', required: false, hint: 'If available online' },
            { name: 'access_date', label: 'Access Date', required: false, hint: 'e.g., 22 July 2021' }
        ],
        format: (data) => {
            if (data.url) {
                return `${data.title}, ${data.year}. ${data.station}, ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
            } else {
                return `${data.title}, ${data.year}. ${data.station}, ${data.date}.`;
            }
        }
    },
    'podcast': {
        title: 'Podcast',
        info: 'For podcast episodes.',
        fields: [
            { name: 'presenter', label: 'Presenter/Host', required: true, hint: 'e.g., Yesterday in Parliament' },
            { name: 'year', label: 'Year', required: true, hint: 'e.g., 2015' },
            { name: 'title', label: 'Episode Title', required: false, hint: 'If applicable' },
            { name: 'series_title', label: 'Podcast Series Title', required: false, hint: 'If applicable' },
            { name: 'date', label: 'Post Date', required: true, hint: 'e.g., 18 June' },
            { name: 'url', label: 'URL', required: true, hint: 'Podcast URL' },
            { name: 'access_date', label: 'Access Date', required: true, hint: 'e.g., 22 July 2021' }
        ],
        format: (data) => {
            const title = data.title ? `${data.title}. ` : '';
            const series = data.series_title ? `<em>${data.series_title}</em>. ` : '';
            return `${data.presenter}, ${data.year}. ${title}${series}[podcast]. ${data.date}. Available at: &lt;${data.url}&gt; [Accessed ${data.access_date}].`;
        }
    },
    'secondary': {
        title: 'Secondary Reference',
        info: 'For citing a source mentioned in another source you have read.',
        fields: [
            { name: 'original_author', label: 'Original Author(s)', required: true, hint: 'e.g., Barber, M. and Mourshed, M.' },
            { name: 'original_year', label: 'Original Year', required: true, hint: 'e.g., 2007' },
            { name: 'original_title', label: 'Original Title', required: true, hint: 'e.g., How the world\'s best-performing school systems' },
            { name: 'original_city', label: 'Original City', required: true, hint: 'e.g., New York, NY' },
            { name: 'original_publisher', label: 'Original Publisher', required: true, hint: 'e.g., McKinsey and Company' },
            { name: 'cited_author', label: 'Cited In - Author', required: true, hint: 'e.g., Spaull, N.' },
            { name: 'cited_year', label: 'Cited In - Year', required: true, hint: 'e.g., 2013' },
            { name: 'cited_title', label: 'Cited In - Title', required: true, hint: 'e.g., South Africa\'s education crisis' },
            { name: 'cited_city', label: 'Cited In - City', required: true, hint: 'e.g., Parktown' },
            { name: 'cited_publisher', label: 'Cited In - Publisher', required: true, hint: 'e.g., Centre for Development and Enterprise' }
        ],
        format: (data) => {
            return `${data.original_author}, ${data.original_year}. <em>${data.original_title}</em>. ${data.original_city}: ${data.original_publisher}. Cited in: ${data.cited_author}, ${data.cited_year}. <em>${data.cited_title}</em>. ${data.cited_city}: ${data.cited_publisher}.`;
        }
    }
};

// Helper functions
function getOrdinal(num) {
    const ordinals = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return ordinals[(v - 20) % 10] || ordinals[v] || ordinals[0];
}

function sanitizeInput(str) {
    if (!str) return '';
    return str.trim().replace(/\s+/g, ' ');
}

/*
 * Stands for: sine anno
 * Meaning: “without year”
 * Use: When the publication date is unknown. Example: Smith, J. (s.a.)…
 * 
 * Stands for: sine loco
 * Meaning: “without place” (location)
 * Use: When the place of publication is unknown. Example: Smith, J. (s.l.)…
 * 
 * Stands for: sine nomine
 * Meaning: “without name”
 * Use: When the publisher’s name is unknown. Example: Smith, J. (s.l.: s.n.) — meaning no place and no publisher are known.
 * 
 */
function handleMissingInfo(value, type) {
    if (!value || value.trim() === '') {
        switch(type) {
            case 'year': return '[s.a.]';
            case 'city': return '[s.l.]';
            case 'publisher': return '[s.n.]';
            default: return '';
        }
    }
    return sanitizeInput(value);
}

// Storage functions
function loadReferences() {
    const stored = localStorage.getItem('iie_references'); // using key value 
    if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        const thirtyDays = 30 * 24 * 60 * 60 * 1000; // can change 30 
        
        /*
         * Data is currently going to be maintained for 30 days in localStorage
         */
        references = data.filter(ref => {
            return (now - ref.timestamp) < thirtyDays;
        });
        
        saveReferences();
        renderReferences();
    }
}

function saveReferences() {
    localStorage.setItem('iie_references', JSON.stringify(references)); // using key value
}

// Render sidebar reference types
function renderSidebar() {
    const container = document.getElementById('referenceTypes');
    container.innerHTML = '';
    
    Object.keys(formTemplates).forEach(key => {
        const li = document.createElement('li');
        const button = document.createElement('button');
        button.dataset.type = key;
        button.textContent = formTemplates[key].title;
        button.addEventListener('click', () => renderForm(key));
        li.appendChild(button);
        container.appendChild(li);
    });
}

// Render form
function renderForm(type, editData = null) {
    currentType = type;
    const template = formTemplates[type];
    const isEdit = editData !== null;
    
    const formTitle = document.getElementById('formTitle');
    const infoBanner = document.getElementById('infoBanner');
    const formElement = document.getElementById('referenceForm');
    const formFields = document.getElementById('formFields');
    
    formTitle.textContent = isEdit ? `Edit: ${template.title}` : template.title;
    infoBanner.textContent = template.info;
    infoBanner.style.display = 'block';
    
    formFields.innerHTML = '';
    
    template.fields.forEach(field => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.innerHTML = `${field.label}${field.required ? ' <span class="required">*</span>' : ''}`;
        
        if (field.tooltip) {
            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.innerHTML = `
                <span class="tooltip-icon">?</span>
                <span class="tooltip-text">${field.tooltip}</span>
            `;
            label.appendChild(tooltip);
        }
        
        let input;
        if (field.type === 'select') {
            input = document.createElement('select');
            input.innerHTML = '<option value="">-- Select --</option>';
            field.options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt.toLowerCase();
                option.textContent = opt;
                input.appendChild(option);
            });
        } else if (field.type === 'textarea') {
            input = document.createElement('textarea');
        } else {
            input = document.createElement('input');
            input.type = 'text';
        }
        
        input.name = field.name;
        input.required = field.required;
        
        if (editData && editData[field.name]) {
            input.value = editData[field.name];
        }
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        
        if (showHints && field.hint) {
            const hint = document.createElement('div');
            hint.className = 'hint';
            hint.textContent = field.hint;
            formGroup.appendChild(hint);
        }
        
        formFields.appendChild(formGroup);
    });
    
    formElement.style.display = 'block';
    
    document.querySelectorAll('.reference-types button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-type="${type}"]`)?.classList.add('active');
}

// Sort and render references
function sortReferences() {
    references.sort((a, b) => {
        const aText = a.text.replace(/<[^>]*>/g, '').toLowerCase();
        const bText = b.text.replace(/<[^>]*>/g, '').toLowerCase();
        return aText.localeCompare(bText);
    });
}

function renderReferences() {
    const container = document.getElementById('referenceList');
    const count = document.getElementById('refCount');
    const actions = document.getElementById('outputActions');
    
    count.textContent = references.length;
    
    if (references.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <p>No references added yet. Select a reference type and fill in the form to get started.</p>
            </div>
        `;
        actions.style.display = 'none';
        return;
    }
    
    sortReferences();
    
    container.innerHTML = references.map((ref, index) => `
        <div class="reference-item">
            <div class="reference-text">${ref.text}</div>
            <div class="reference-actions">
                <button class="btn btn-small btn-secondary" onclick="editReference(${index})">Edit</button>
                <button class="btn btn-small btn-danger" onclick="deleteReference(${index})">Delete</button>
            </div>
        </div>
    `).join('');
    
    actions.style.display = 'flex';
}

// Add reference
function addReference(formData) {
    const template = formTemplates[currentType];
    
    const processedData = {};
    for (let [key, value] of formData.entries()) {
        if (key.includes('year') && !key.includes('letter')) {
            processedData[key] = handleMissingInfo(value, 'year');
        } else if (key.includes('city')) {
            processedData[key] = handleMissingInfo(value, 'city');
        } else if (key.includes('publisher')) {
            processedData[key] = handleMissingInfo(value, 'publisher');
        } else {
            processedData[key] = sanitizeInput(value);
        }
    }
    
    const formattedText = template.format(processedData);
    
    if (editingIndex !== null) {
        references[editingIndex] = {
            text: formattedText,
            type: currentType,
            data: processedData,
            timestamp: references[editingIndex].timestamp
        };
        editingIndex = null;
    } else {
        references.push({
            text: formattedText,
            type: currentType,
            data: processedData,
            timestamp: Date.now()
        });
    }
    
    saveReferences();
    renderReferences();
}

// Edit reference
function editReference(index) {
    editingIndex = index;
    const ref = references[index];
    renderForm(ref.type, ref.data);
    document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth' });
}

// Delete reference
function deleteReference(index) {
    if (confirm('Are you sure you want to delete this reference?')) {
        references.splice(index, 1);
        saveReferences();
        renderReferences();
    }
}

// Copy all references with proper formatting
function copyAllReferences() {
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.innerHTML = references.map(ref => `<p>${ref.text}</p>`).join('');
    document.body.appendChild(tempDiv);
    
    const range = document.createRange();
    range.selectNodeContents(tempDiv);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            alert(`Successfully copied ${references.length} reference(s) to clipboard!`);
        } else {
            throw new Error('Copy command failed');
        }
    } catch (err) {
        alert('Failed to copy references. Please select and copy manually.');
    }
    
    document.body.removeChild(tempDiv);
    selection.removeAllRanges();
}

// Download as text file
function downloadTxtFile() {
    const plainText = references.map(ref => {
        return ref.text
            .replace(/<em>/g, '')
            .replace(/<\/em>/g, '')
            .replace(/<sup>/g, '')
            .replace(/<\/sup>/g, '')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>');
    }).join('\n\n');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const filename = `ReferenceList_${timestamp}.txt`;
    
    const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Clear all
function clearAllReferences() {
    if (confirm('Are you sure you want to clear all references? This cannot be undone.')) {
        references = [];
        saveReferences();
        renderReferences();
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    loadReferences();
    
    // Hints toggle
    document.getElementById('hintsToggle').addEventListener('change', (e) => {
        showHints = e.target.checked;
        if (currentType) {
            renderForm(currentType, editingIndex !== null ? references[editingIndex].data : null);
        }
    });
    
    // Form submission
    document.getElementById('referenceForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        addReference(formData);
        e.target.reset();
        editingIndex = null;
        document.getElementById('referenceList').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
    
    // Clear form
    document.getElementById('clearForm').addEventListener('click', () => {
        document.getElementById('referenceForm').reset();
        editingIndex = null;
    });
    
    // Output actions
    document.getElementById('copyAll').addEventListener('click', copyAllReferences);
    document.getElementById('downloadTxt').addEventListener('click', downloadTxtFile);
    document.getElementById('clearAll').addEventListener('click', clearAllReferences);
});
