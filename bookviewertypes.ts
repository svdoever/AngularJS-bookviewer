interface IBookViewerBookToc {
    Year: number;
    Name: string;
    Chapters: IBookViewerChapterToc[];
}

interface IBookViewerChapterToc {
    Id: string;
    Title: string;
    Paragraphs: IBookViewerParagraphToc[];
}

interface IBookViewerParagraphToc {
    Id: string;
    Title: string;
    Paragraphs: IBookViewerParagraphToc[];
}

interface IBookViewerBook {
    Year: number;
    Name: string;
    Chapters: IBookViewerChapter[];
}

interface IBookViewerChapter {
    Id: string;
    Title: string;
    Content: string;
    Paragraphs: IBookViewerParagraph[];
}

interface IBookViewerParagraph {
    Id: string;
    Title: string;
    Content: string;
    Paragraphs: IBookViewerParagraph[];
}
