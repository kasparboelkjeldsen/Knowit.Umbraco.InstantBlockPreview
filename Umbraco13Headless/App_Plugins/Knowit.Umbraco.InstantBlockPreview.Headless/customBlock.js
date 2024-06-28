angular.module("umbraco").controller("customBlockController", [
    '$scope',
    '$attrs',
    'editorState',
    'eventsService',
    function ($scope, $attrs, editorState) {
        const blockType = $attrs.blockType;

        $scope.enableBlockEdit = true;

        const apiEndpoints = {
            renderSSRComponent: '/umbraco/api/PreviewRendering/RenderComponent',
        };

        $scope.$watch('block.data', (newValue) => handleBlockDataChange(newValue, $scope.block.settingsData), true);
        $scope.$watch('block.settingsData', (newValue) => handleBlockDataChange($scope.block.data, newValue), true);

        function fetchData(endpoint, dataToFetch) {
            return fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToFetch)
            })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    throw new Error('Something went wrong');
                });
        }

        function updateHtml(json) {
            $scope.$apply(() => {
                $scope.html = json.html;
            });
        }


        function handleBlockDataChange(newValue, settingsData) {

            if (newValue) {
                console.log(newValue)
                const data = {
                    Content: stringify(newValue),
                    Settings: stringify(settingsData),
                    ControllerName: $scope.block.content.contentTypeAlias,
                    BlockType: blockType,
                    isApp: false,
                    contentId: editorState.getCurrent().id
                };

                fetchData(apiEndpoints.renderSSRComponent, data).then(updateHtml).catch(error => console.log(error));
            }
        }

    }
]);


// try to prevent circular references, which may occour if you for instance put a grid in a grid or a block list in a grid etc.
function stringify(obj) {
    let cache = [];
    return JSON.stringify(obj, function (key, value) {
        const unneededKeys = ["_parentForm", "__scope", "$block"];
        if (unneededKeys.includes(key)) {
            return;
        }
        if (typeof value === "object" && value !== null) {
            if (cache.indexOf(value) !== -1) {
                return;
            }
            cache.push(value);
        }
        return value;
    });
}

// angular won't let us add <script> tags to the inner html of elements.. So we'll force it
angular.module('umbraco').directive('executeScripts', function ($sce, $parse) {
    return {
        restrict: 'A', // no idea, ask chat gpt
        scope: {
            executeScripts: '='
        },
        link: function (scope, element) {
            scope.$watch('executeScripts', function (htmlContent) {

                if (htmlContent && htmlContent != element[0].innerHTML) {

                    element.html(htmlContent);
                }
            });
        }
    };
});
