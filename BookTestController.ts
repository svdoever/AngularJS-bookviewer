/// <reference path='angular.d.ts' />
/// <reference path='bootstrap.d.ts' />
/// <reference path='lazy.js.d.ts' />
/// <reference path='bookviewertypes.ts'/>

angular.module('plunker', ['ui.bootstrap', 'directive.bookviewer'])
    .controller("BookTestController", ['$scope', '$location', '$log', function ($scope:IBookControllerScope, $location, $log) {
        new BookController($scope, $location, $log);
    }]);

var sampletoc = <IBookViewerBookToc>{
    "Year":2014,
    "Name":"Sample book",
    "Chapters":[
        { "Id":"SampleId1", "Title":"1. Sample chapter one",
            "Paragraphs":[
                {"Id":"SampleId1.1", "Title":"1.1 First sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId1.2", "Title":"1.2 Second sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId1.3", "Title":"1.3 Third sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId1.4", "Title":"1.4 Fourth sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId1.5", "Title":"1.5 Fifth sample paragraph", "Paragraphs":[]},
            ]
        },
        {"Id":"SampleId2","Title":"2. Sample chapter two", "Paragraphs":[]},
        {"Id":"SampleId3","Title":"3. Sample chapter three",
            "Paragraphs":[
                {"Id":"SampleId3.1", "Title":"3.1 First sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId3.2", "Title":"3.2 Second sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId3.3", "Title":"3.3 Third sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId3.4", "Title":"3.4 Fourth sample paragraph", "Paragraphs":[]},
                {"Id":"SampleId3.5", "Title":"3.5 Fifth sample paragraph", "Paragraphs":[]},
            ]
        },
        {"Id":"SampleId4","Title":"4. Sample chapter four", "Paragraphs":[]},
        {"Id":"SampleId5","Title":"5. Sample chapter five", "Paragraphs":[]},
    ]
};

var lorumIpsumText = "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse vitae facilisis diam, vel congue orci. Nulla bibendum ipsum eget lectus scelerisque, ac pellentesque eros aliquam. Quisque ac libero bibendum, convallis est eget, lobortis risus. Donec faucibus metus et orci volutpat, vitae dapibus magna posuere. Integer rutrum mattis condimentum. Mauris quis justo id felis convallis fermentum. Integer vitae nibh non purus posuere congue a sed arcu. Mauris porta semper mauris, nec aliquet purus dignissim in. Nullam mauris velit, semper ut nisi ac, cursus pulvinar nulla. Etiam congue vestibulum orci. Phasellus adipiscing suscipit sem id consectetur.</p><p>Aenean faucibus tristique velit, ut sagittis mauris interdum ut. Sed consequat quis lectus quis mollis. Vestibulum turpis arcu, dignissim in imperdiet eu, ullamcorper vel quam. Quisque cursus gravida neque, at vestibulum massa tempor pretium. Etiam ac est nisl. Ut enim dui, viverra in luctus vulputate, sollicitudin sed magna. Quisque id odio eget sem tincidunt lacinia sed nec dolor. Etiam sagittis ligula vel tempor suscipit. Nullam molestie lobortis justo in molestie. Pellentesque ac purus quis arcu cursus gravida.</p>";
lorumIpsumText += "<p>";
lorumIpsumText += "<ul>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId1'>1. Sample chapter one</a></li>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId1.3'>1.3 Third sample paragraph</a></li>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId1.5'>1.5 Fifth sample paragraph</a></li>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId3'>3. Sample chapter three</a></li>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId3.3'>3.3 Third sample paragraph</a></li>";
lorumIpsumText += "<li><a href='#' data-ref='SampleId3.5'>3.5 Fifth sample paragraph</a></li>";
lorumIpsumText += "</ul>";
lorumIpsumText += "</p>";

var samplebook = <IBookViewerBook>{
    "Year":2014,
    "Name":"Sample book",
    "Chapters":[
        { "Id":"SampleId1","Title":"1. Sample chapter one","Content":"<p>1. Sample chapter one<ul><li>alpha</li><li>beta</li></ul></p>",
            "Paragraphs":[
                {"Id":"SampleId1.1", "Title":"1.1 First sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId1.2", "Title":"1.2 Second sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId1.3", "Title":"1.3 Third sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId1.4", "Title":"1.4 Fourth sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId1.5", "Title":"1.5 Fifth sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]}
            ]
        },
        {"Id":"SampleId2","Title":"2. Sample chapter two","Content":"This is the content of sample chapter 2.", "Paragraphs":[]},
        {"Id":"SampleId3","Title":"3. Sample chapter three","Content":"This is the content of sample chapter 3.",
            "Paragraphs":[
                {"Id":"SampleId3.1", "Title":"3.1 First sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId3.2", "Title":"3.2 Second sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId3.3", "Title":"3.3 Third sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId3.4", "Title":"3.4 Fourth sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]},
                {"Id":"SampleId3.5", "Title":"3.5 Fifth sample paragraph", "Content":lorumIpsumText, "Paragraphs":[]}
            ]
        },
        {"Id":"SampleId4","Title":"4. Sample chapter four","Content":"This is the content of sample chapter 4.", "Paragraphs":[]},
        {"Id":"SampleId5","Title":"5. Sample chapter five","Content":"This is the content of sample chapter 5.", "Paragraphs":[]}
    ]
};

interface IBookControllerScope extends ng.IScope {
    vm: IBookController;
}

interface IBookController {
    toc : IBookViewerBookToc;
    chapter : IBookViewerChapter;
    anchorid: string;
    lastid: string;
    indexmode : boolean;
    error: string;
    select: (text: string) => void;
    navigate: (chapterid: string, anchordid: string) => void;
    showHideIndex: () => void;
}

class BookController implements IBookController {
    toc : IBookViewerBookToc;
    chapter : IBookViewerChapter;
    anchorid: string;
    lastid: string;
    indexmode : boolean;
    error: string;
    select: (text: string) => void;
    navigate: (chapterid: string, anchordid: string) => void;
    showHideIndex: () => void;

    constructor(private $scope:IBookControllerScope, $location:ng.ILocationService, private $log) {
        this.toc = sampletoc;
        this.chapter = samplebook.Chapters[0];
        this.anchorid = "SampleId1";
        this.lastid = this.anchorid;
        this.indexmode = false; // initially display chapter text
        this.error = null; // assume no error

        this.navigate = (chapterid: string, anchorid: string) => {
            $log.debug("Navigate to chapterid: '" + chapterid + "', anchorid: '" + anchorid + "'");
            this.chapter = Lazy(samplebook.Chapters).where({'Id': chapterid}).first();
            this.anchorid = anchorid;
        };
        this.select = (text: string) => {
            window.alert("Selected text: " + text);
        };
        this.showHideIndex = () => { this.indexmode = !this.indexmode }

        $scope.vm = this;
    }
}