/// <reference path='jquery.d.ts' />
/// <reference path='angular.d.ts' />
/// <reference path='bootstrap.d.ts' />
/// <reference path='bookviewertypes.ts' />
angular.module('directive.bookviewer', []).constant('bookviewerConfig', {}).controller('bookviewerController', [
    '$scope',
    '$element',
    '$attrs',
    '$sce',
    '$location',
    '$anchorScroll',
    '$timeout',
    '$log',
    function ($scope, $element, $attrs, $sce, $location, $anchorScroll, $timeout, $log) {
        $scope.savedElement = $element;
        $scope.savedAttrs = $attrs;

        $scope.trustAsHtml = function (html) {
            return $sce.trustAsHtml(html);
        };

        $scope.indexOpenChapterIndex = function (chapterIndexId) {
            var hashId = $location.hash();
            $log.info("indexOpenChapterIndex: test hash=" + hashId + ", chapter id=" + chapterIndexId + "==> return=" + (hashId === chapterIndexId));
            return hashId === chapterIndexId;
        };

        // Find the chapter for a given Id.
        // First iterate on chapter level, then iterate recursively through all (sub-)paragraphs.
        $scope.id2chapter = function (chapters, id) {
            function paragraphsContainId(paragraphs, id) {
                var numberOfParagraphs = paragraphs.length;

                for (var i = 0; i < numberOfParagraphs; i++) {
                    if (paragraphs[i].Id === id) {
                        return true;
                    }
                    if (paragraphsContainId(paragraphs[i].Paragraphs, id)) {
                        return true;
                    }
                }
                return false;
            }

            var numberOfChapters = chapters.length;
            var i;
            for (i = 0; i < numberOfChapters; i++) {
                if (chapters[i].Id === id) {
                    return chapters[i];
                }
            }
            for (i = 0; i < numberOfChapters; i++) {
                if (paragraphsContainId(chapters[i].Paragraphs, id)) {
                    return chapters[i];
                }
            }
            return null;
        };

        $scope.navigate = function (id) {
            $location.hash(id);
            $scope.$apply(function () {
                $location.hash(id);
            });
        };

        // Link within the chapter or index selected, scroll to it
        $scope.navigateToAnchor = function (id, indexmode) {
            // within this chapter
            $log.debug("Directive 'bookviewer':navigateToAnchor: navigate to id '" + id + "' within this chapter");
            $scope.indexmode = indexmode;
            $timeout(function () {
                $location.hash(id);
                $anchorScroll();
                $log.debug("-------- Directive bookviewer: hash set and scroll processed. Current hash: " + $location.hash() + " -------");
            }, 0);
        };

        // Link within the chapter selected, scroll to it
        $scope.navigateBookOld = function (id) {
            var chapterToNavigateTo = $scope.id2chapter($scope.booktoc.Chapters, id);
            if (chapterToNavigateTo == null) {
                $log.error("Directive 'bookviewer':navigateBook: the id '" + id + "' is not found in the book table of contents (booktoc). Can't navigate.");
                return;
            }

            if (chapterToNavigateTo.Id === $scope.chaptercontent.Id) {
                // within this chapter
                $log.debug("Directive 'bookviewer':navigateBook: navigate to id '" + id + "' within this chapter");
                $scope.indexmode = false;
                $location.hash(id);
                $anchorScroll();
                $log.debug("-------- Directive bookviewer: hash set and scroll processed. Current hash: " + $location.hash() + " -------");
            } else {
                $log.debug("Directive 'bookviewer':navigateBook: navigate to id '" + id + "' in chapter with id '" + id + "'");
                if (angular.isDefined($scope.savedAttrs.onNavigate)) {
                    $log.debug("Directive 'bookviewer':on-navigate: chapterid=" + chapterToNavigateTo.Id + ", anchorid=" + id);
                    $scope.onNavigate({ chapterid: chapterToNavigateTo.Id, anchorid: id });
                } else {
                    $log.error("Directive 'bookviewer':navigateBook: no 'on-navigate' attribute specified. Can't navigate to other chapters.");
                }
            }
        };

        // jump to anchor element using its offset does not work in attached() callback, only in compositionComplete() callback.
        // See documentation at http://durandaljs.com/documentation/Interacting-with-the-DOM/: "If you need to measure DOM elements, this is the place to do it."
        $scope.processDom = function () {
            // Configure css styling for anchors to use shift for fixed navigation at top of screen
            var offset = "0px";
            if (angular.isDefined($scope.savedAttrs.offsetHeight)) {
                if (angular.isNumber($scope.offsetHeight)) {
                    offset = $scope.offsetHeight + "px";
                } else {
                    throw ("Directive 'bookviewer': offset in offset-height attribute is not valid: " + $scope.offsetHeight);
                }
            } else if (angular.isDefined($scope.savedAttrs.offsetElementId)) {
                var el = angular.element('#' + $scope.offsetElementId);
                if (el.length == 0) {
                    throw ("Directive 'bookviewer': element with id in offset-element-id attribute is not found valid: " + $scope.offsetElementId);
                }
                if (el.length > 1) {
                    throw ("Directive 'bookviewer': element with id in offset-element-id attribute resolves to multiple elements: " + $scope.offsetElementId);
                }

                offset = (-1 * el.outerHeight()).toString() + "px";
            }

            // offset = 0; //TODO: for now, no offset
            var anchorsInChapter = $scope.savedElement.find('a.anchor');
            anchorsInChapter.css({
                display: "block",
                position: "relative",
                top: offset
            });

            // modify 'a' tags with only data-ref to contain onclick event
            //var elements = getAllAnchorElementsWithAttributeDataHref($scope.savedElement[0]);
            var elements = $scope.savedElement.find('a[data-ref]');
            $log.debug("Directive 'bookviewer': found " + elements.length + " anchors with data-ref attributes");
            angular.forEach(elements, function (el) {
                var $element = angular.element(el);
                var dataref = $element.attr('data-ref');
                if (dataref) {
                    $element.attr('href', 'javascript:void(0)');

                    // return false, otherwise after click event the page navigates to '#'
                    $element.bind('click', function (event) {
                        $scope.navigate(dataref);
                    });
                }
            });
        };

        $scope.$watch('indexmode', function (newValue, oldValue) {
            $log.debug("Directive 'bookviewer': indexmode changed to " + newValue);
            if (newValue === true) {
                // TODO: scroll to the index element of the current chapter. Code does not work...
                $timeout(function () {
                    $log.debug("Directive 'bookviewer': in indexmode, scroll to " + 'i-' + $scope.chaptercontent.Id);

                    $location.hash('i-' + $scope.chaptercontent.Id);
                    $anchorScroll();
                }, 0);
            }
        });

        $scope.$watch(function () {
            return $location.hash();
        }, function () {
            var id = $location.hash();
            var idToGetChapterFor;
            var indexmode;

            if (id && id !== '') {
                if (id.substr(0, 2) === "i-") {
                    $log.debug("Directive 'bookviewer': navigate to id '" + id + "' in index mode");
                    idToGetChapterFor = id.substr(2);
                    indexmode = true;
                } else {
                    $log.debug("Directive 'bookviewer': navigate to id '" + id + "'");
                    idToGetChapterFor = id;
                    indexmode = false;
                }

                var chapterTocOfNewId = $scope.id2chapter($scope.booktoc.Chapters, idToGetChapterFor);
                if (chapterTocOfNewId == null) {
                    $log.error("Directive 'bookviewer': hash() changed: the id '" + id + "' is not found in the book table of contents (booktoc). Can't navigate.");
                    return;
                }

                if (chapterTocOfNewId.Id !== $scope.chaptercontent.Id) {
                    $log.debug("Need to change from chapter with id '" + $scope.chaptercontent.Id + "' to chapter with id '" + chapterTocOfNewId.Id + "'");
                    $scope.onNavigate({ chapterid: chapterTocOfNewId.Id, anchorid: id });
                    $log.debug("Directive 'bookviewer': change of $location.hash() processed. Current hash: " + $location.hash() + " -------");
                } else {
                    // Navigate in the current chapter content
                    $scope.navigateToAnchor(id, indexmode);
                }
            }
        });

        $scope.$watch('[chaptercontent.Id, anchorid]', function (newValues, oldValues) {
            if (newValues[0] !== oldValues[0]) {
                $log.debug("Directive 'bookviewer': chapter change from '" + oldValues[0] + "' to '" + newValues[0] + "', new content needs DOM processing.");

                // Chapter change, new content that needs processing, do DOM processing in timeout, otherwise DOM not updated yet
                $timeout(function () {
                    $scope.processDom();

                    if (angular.isDefined($scope.savedAttrs.anchorid)) {
                        $scope.navigateToAnchor($scope.anchorid, $scope.anchorid.substr(0, 2) === "i-");
                    } else {
                        $scope.navigateToAnchor($scope.chaptercontent.Id, false);
                    }
                }, 0);
            }
        }, true);
    }
]).directive('bookviewer', function ($sce, $timeout) {
    var directive = {};
    directive.restrict = 'E';
    directive.scope = {
        'booktoc': '=',
        'chaptercontent': '=',
        'indexmode': '=',
        'anchorid': '=',
        'offsetHeight': '=',
        'offsetElementId': '=',
        'onNavigate': '&',
        'onSelect': '&'
    };
    directive.templateUrl = 'bookviewer.html';
    directive.controller = 'bookviewerController';
    directive.link = function ($scope, $element, $attrs) {
        $timeout(function () {
            $scope.processDom();

            if (angular.isDefined($scope.savedAttrs.anchorid)) {
                $scope.navigateToAnchor($scope.anchorid, $scope.anchorid.substr(0, 2) === "i-");
            } else {
                $scope.navigateToAnchor($scope.chaptercontent.Id, false);
            }
        }, 0);
    };

    return directive;
});
//# sourceMappingURL=bookviewer.js.map
