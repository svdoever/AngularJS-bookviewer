/// <reference path='jquery.d.ts' />
/// <reference path='angular.d.ts' />
/// <reference path='bootstrap.d.ts' />
/// <reference path='bookviewertypes.ts' />

angular.module('directive.bookviewer', [])
    .constant('bookviewerConfig', {
    })
    .controller('bookviewerController', ['$scope', '$element', '$attrs', '$sce', '$location', '$anchorScroll', '$timeout', '$log',
      function($scope:IBookViewerScope, $element, $attrs, $sce, $location:ng.ILocationService, $anchorScroll, $timeout, $log) : void {
        $scope.savedElement = $element; // keep track of element for usage in later code
        $scope.savedAttrs = $attrs;  // keep track of attributes for usage in later code

        $scope.trustAsHtml = (html:string) : any => {
            return $sce.trustAsHtml(html);
        };


        $scope.indexOpenChapterIndex = (chapterIndexId:string) => {
            var hashId = $location.hash();
            $log.info("indexOpenChapterIndex: test hash=" + hashId + ", chapter id=" +chapterIndexId + "==> return=" + (hashId === chapterIndexId));
            return hashId === chapterIndexId;
        }

        // Find the chapter for a given Id.
        // First iterate on chapter level, then iterate recursively through all (sub-)paragraphs.
        $scope.id2chapter = (chapters: IBookViewerChapterToc[], id: string) : IBookViewerChapterToc => {
            function paragraphsContainId(paragraphs: IBookViewerParagraphToc[], id: string) : boolean
            {
                var numberOfParagraphs: number = paragraphs.length;

                for (var i:number=0; i<numberOfParagraphs; i++)
                {
                    if (paragraphs[i].Id === id)
                    {
                        return true;
                    }
                    if (paragraphsContainId(paragraphs[i].Paragraphs, id))
                    {
                        return true;
                    }
                }
                return false;
            }

            var numberOfChapters: number = chapters.length;
            var i: number;
            for (i=0; i<numberOfChapters; i++) { if (chapters[i].Id === id) { return chapters[i]; } }
            for (i=0; i<numberOfChapters; i++) { if (paragraphsContainId(chapters[i].Paragraphs, id)) { return chapters[i]; } }
            return null;
        }

          $scope.navigate = (id:string): void => {
              $location.hash(id);
              $scope.$apply(() => {$location.hash(id); });
          }

        // Link within the chapter or index selected, scroll to it
        $scope.navigateToAnchor = (id: string, indexmode: boolean): void => {
            // within this chapter
            $log.debug("Directive 'bookviewer':navigateToAnchor: navigate to id '" + id + "' within this chapter");
            $scope.indexmode = indexmode; // show the chapter contents (again?)
            $timeout(() => { // wait for switch from indexmode
                $location.hash(id);
                $anchorScroll();
                $log.debug("-------- Directive bookviewer: hash set and scroll processed. Current hash: " + $location.hash() + " -------");
            }, 0);
        }


          // Link within the chapter selected, scroll to it
          $scope.navigateBookOld = (id: string): void => {
              var chapterToNavigateTo = $scope.id2chapter($scope.booktoc.Chapters, id);
              if (chapterToNavigateTo == null) {
                  $log.error("Directive 'bookviewer':navigateBook: the id '" + id + "' is not found in the book table of contents (booktoc). Can't navigate.")
                  return;
              }

              if (chapterToNavigateTo.Id === $scope.chaptercontent.Id) {
                  // within this chapter
                  $log.debug("Directive 'bookviewer':navigateBook: navigate to id '" + id + "' within this chapter");
                  $scope.indexmode = false; // show the chapter contents (again?)
                  $location.hash(id);
                  $anchorScroll();
                  $log.debug("-------- Directive bookviewer: hash set and scroll processed. Current hash: " + $location.hash() + " -------");
              }
              else {
                  $log.debug("Directive 'bookviewer':navigateBook: navigate to id '" + id +"' in chapter with id '" + id + "'");
                  if (angular.isDefined($scope.savedAttrs.onNavigate))
                  {
                      $log.debug("Directive 'bookviewer':on-navigate: chapterid=" + chapterToNavigateTo.Id + ", anchorid=" + id);
                      $scope.onNavigate(<IOnNavigateArguments>{ chapterid: chapterToNavigateTo.Id, anchorid: id });
                  }
                  else {
                      $log.error("Directive 'bookviewer':navigateBook: no 'on-navigate' attribute specified. Can't navigate to other chapters.");
                  }
              }
          }

          // jump to anchor element using its offset does not work in attached() callback, only in compositionComplete() callback.
        // See documentation at http://durandaljs.com/documentation/Interacting-with-the-DOM/: "If you need to measure DOM elements, this is the place to do it."

        $scope.processDom = () => {
            // Configure css styling for anchors to use shift for fixed navigation at top of screen
            var offset: string = "0px";
            if (angular.isDefined($scope.savedAttrs.offsetHeight)) {
                if (angular.isNumber($scope.offsetHeight)) {
                    offset = $scope.offsetHeight + "px";
                }
                else {
                    throw("Directive 'bookviewer': offset in offset-height attribute is not valid: " + $scope.offsetHeight);
                }
            }
            else if (angular.isDefined($scope.savedAttrs.offsetElementId)) {
                var el:HTMLElement = document.getElementById($scope.offsetElementId);
                if (!el) {
                    throw("Directive 'bookviewer': element with id in offset-element-id attribute is not found valid: " + $scope.offsetElementId);
                }

                offset = (-1 * el.offsetHeight).toString() + "px";
            }

            // modify 'a' tags with data-ref to contain onclick event and a no-op href
            angular.forEach($scope.savedElement[0].getElementsByTagName('a'), (el:HTMLAnchorElement) => {
                var $element = angular.element(el);

                var dataref:string = $element.attr('data-ref');
                if (dataref)
                {
                    $log.debug("Directive 'bookviewer': found anchor with data-ref attribute");
                    $element.attr('href', 'javascript:void(0)');
                    // return false, otherwise after click event the page navigates to '#'
                    $element.bind('click', (event) => {
                        $scope.navigate(dataref);
                    });
                }

                // if its an anchor element and offset is not 0px, give the element a negative offset to compensate for fixed bar at top
                if (offset !== '0px' && $element.hasClass('anchor')) {
                    $element.css({
                        display: "block",
                        position: "relative",
                        top: offset
                    });
                }
            });
        }

        $scope.$watch('indexmode', (newValue, oldValue) => {
            $log.debug("Directive 'bookviewer': indexmode changed to " + newValue);
            if (newValue === true) {
                // TODO: scroll to the index element of the current chapter. Code does not work...
                $timeout(() => {
                    $log.debug("Directive 'bookviewer': in indexmode, scroll to " + 'i-' + $scope.chaptercontent.Id);

                    $location.hash('i-' + $scope.chaptercontent.Id);
                    $anchorScroll();
                }, 0);
            }
        });

        $scope.$watch(
              () => {
                  return $location.hash();
              },
              () => {
                  var id: string = $location.hash();
                  var idToGetChapterFor: string;
                  var indexmode: boolean;

                  //if (id && id !== '' && $scope.vm.lastid && id !== $scope.vm.lastid) {
                  // $log.debug("Change of id from '" + $scope.vm.lastid + "' to '" + id + "'");
                  if (id && id !== '') {
                      if (id.substr(0,2) === "i-") { // it is an index page view
                          $log.debug("Directive 'bookviewer': navigate to id '" + id + "' in index mode");
                          idToGetChapterFor = id.substr(2);
                          indexmode = true;
                      } else {
                          $log.debug("Directive 'bookviewer': navigate to id '" + id + "'");
                          idToGetChapterFor = id;
                          indexmode = false;
                      }

                      var chapterTocOfNewId:IBookViewerChapterToc = $scope.id2chapter($scope.booktoc.Chapters, idToGetChapterFor);
                      if (chapterTocOfNewId == null) {
                          $log.error("Directive 'bookviewer': hash() changed: the id '" + id + "' is not found in the book table of contents (booktoc). Can't navigate.")
                          return;
                      }

                      if (chapterTocOfNewId.Id !== $scope.chaptercontent.Id) {
                          $log.debug("Need to change from chapter with id '" + $scope.chaptercontent.Id + "' to chapter with id '" + chapterTocOfNewId.Id + "'");
                          $scope.onNavigate({chapterid:chapterTocOfNewId.Id, anchorid:id}); // will implicitly switch away from indexmode through $watch on hash change
                          $log.debug("Directive 'bookviewer': change of $location.hash() processed. Current hash: " + $location.hash() + " -------");
                      }
                      else {
                          // Navigate in the current chapter content
                          $scope.navigateToAnchor(id, indexmode);
                      }
                  }
              }
        );

        $scope.$watch('[chaptercontent.Id, anchorid]', function (newValues, oldValues) {
            if (newValues[0] !== oldValues[0]) {
                $log.debug("Directive 'bookviewer': chapter change from '" + oldValues[0] + "' to '" + newValues[0] + "', new content needs DOM processing.");
                // Chapter change, new content that needs processing, do DOM processing in timeout, otherwise DOM not updated yet
                $timeout(() => {
                    $scope.processDom();

                    // navigate to anchor if specified in the anchorid attribute, otherwise navigate to beginning of chapter
                    if (angular.isDefined($scope.savedAttrs.anchorid)) {
                        if ($scope.anchorid && $scope.anchorid.length > 2) {
                            $scope.navigateToAnchor($scope.anchorid, $scope.anchorid.substr(0,2) === "i-");
                        }
                    } else {
                        if ($scope.chaptercontent) {
                            $scope.navigateToAnchor($scope.chaptercontent.Id, false);
                        }
                    }
                }, 0);
            }
        }, true);
    }])
    .directive('bookviewer',
        function ($sce, $timeout):ng.IDirective {
            var directive: ng.IDirective = {};
            directive.restrict = 'E';
            directive.scope = {
                'booktoc': '=', // the TOC of the complete book
                'chaptercontent': '=', // the content of the current chapter
                'indexmode': '=', // if true the index is displayed, if false the contents of the chapter
                'anchorid': '=', // anchorid to jump to, jump to chaptercontent.Id if not specified
                'offsetHeight': '=', // height of fixed area at top for scroll offset
                'offsetElementId': '=', // id of the element to determine the height of for scroll offset
                'onNavigate': '&', // function to call on navigation outside the current chapter: onNavigate(chapterid, anchorid)
                'onSelect': '&' // function to call on selection of a piece of content: onSelect(content)
            };
            directive.templateUrl = 'bookviewer.html';
            directive.controller = 'bookviewerController';
            directive.link = ($scope: IBookViewerScope, $element, $attrs) : void => {
                $timeout(() => {
                    $scope.processDom();

                    // navigate to anchor if specified in the anchorid attribute, otherwise navigate to beginning of chapter
                    if (angular.isDefined($scope.savedAttrs.anchorid)) {
                        $scope.navigateToAnchor($scope.anchorid, $scope.anchorid.substr(0,2) === "i-");
                    } else {
                        $scope.navigateToAnchor($scope.chaptercontent.Id, false);
                    }
                }, 0);
              };

            return directive;
        }
    );

interface IBookViewerScope extends ng.IScope {
    booktoc: IBookViewerBookToc;
    chaptercontent: IBookViewerChapter;
    indexmode: boolean;
    anchorid: string;
    offsetHeight: number;
    offsetElementId: string;
    onSelect: (args: IOnSelectArguments) => void;
    onNavigate: (args: IOnNavigateArguments) => void;

    // keep track of element we are working on and its attributes
    savedElement: any;
    savedAttrs: any;

    // methods on scope
    trustAsHtml: (html:string) => any; // return a TrustedValueHolderType, not defined in angularjs.d.ts
    indexOpenChapterIndex: (chapterid:string) => boolean;
    id2chapter: (chapters: IBookViewerChapterToc[], id: string) => IBookViewerChapterToc;
    processDom: () => void;
    navigate: (id:string) => void;
    navigateToAnchor: (id:string, indexmode:boolean) => void;
    navigateBookOld: (id:string) => void;
}

interface IOnSelectArguments {
    text: string;
}

interface IOnNavigateArguments {
    chapterid: string;
    anchorid: string;
}


