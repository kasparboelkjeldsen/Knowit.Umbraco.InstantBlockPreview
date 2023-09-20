angular.module("umbraco").controller("customBlockController", function ($scope, editorState, eventsService) {

    function fetchData(dataToFetch) {
        fetch('/umbraco/api/CustomPreview/RenderPartial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dataToFetch)
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong');
        }).then(json => {
            $scope.$apply(() => {
                $scope.html = json.html;
            });
        }).catch((error) => {
            console.log(error)
        });
    }

    $scope.$watch('block.data', function (newValue) {
        if (newValue) {
            const json = stringify(newValue);

            const data = {
                ScopeChange: json,
                ControllerName: $scope.block.label
            };
            fetchData(data);
        }
    }, true);

    setTimeout(() => {
        const data = {
            ScopeChange: JSON.stringify($scope.block.data),
            ControllerName: $scope.block.label
        };
        fetchData(data);
    }, 10);
});

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


angular.module('umbraco').directive('executeScripts', function ($sce, $parse) {
    return {
        restrict: 'A',
        scope: {
            executeScripts: '='
        },
        link: function (scope, element) {
            var scriptsProcessed = false;

            scope.$watch('executeScripts', function (htmlContent) {
                console.log('debug')
                if (htmlContent && !scriptsProcessed) {
                    element.html(htmlContent);

                    var scripts = Array.from(element[0].getElementsByTagName("script"));
                    scripts.forEach(function (oldScript) {
                        var scriptTag = document.createElement('script');
                        if (oldScript.src) {
                            scriptTag.src = oldScript.src;
                        } else {
                            const script = (oldScript.innerText || oldScript.textContent);
                            const r = (Math.floor(Math.random() * 100000) + 1).toString();
                            const funcName = `jsInjection_${r}`

                            scriptTag.textContent = `
                            function ${funcName}(document) {
                                ${script}
                            }`;

                            oldScript.parentNode.replaceChild(scriptTag, oldScript);

                            const el = element[0];
                            // create getELementById since that's normally only supported on document
                            // and we are faking a document so most scripts will keep running.
                            el.getElementById = function (id) { return el.querySelector(`#${id}`) };
                            window[funcName](el);
                            console.log(funcName);
                        }


                    });
                    scriptsProcessed = true;
                }
                else if (htmlContent) {
                    element.html(htmlContent);
                }
            });
        }
    };
});
