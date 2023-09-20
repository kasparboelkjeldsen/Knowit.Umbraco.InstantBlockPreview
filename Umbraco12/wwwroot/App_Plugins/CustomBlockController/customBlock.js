angular.module("umbraco").controller("customBlockController", function ($scope, editorState, eventsService) {
    
    function stringify(obj) {
        let cache = [];
        let str = JSON.stringify(obj, function (key, value) {
            if (key == "_parentForm" || key == "__scope" || key == "$block") { //skip keys that will give us unneeded circular reference, like grid in grid
                return;
            }
            if (typeof value === "object" && value !== null) {
                if (cache.indexOf(value) !== -1) {
                    // Circular reference found, discard key
                    return;
                }
                // Store value in our collection
                cache.push(value);
            }
            return value;
        });
        cache = null; // reset the cache
        return str;
    }

    $scope.$watch('block.data', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            const json = stringify(newValue);
            

            const data = {
                ScopeChange: json,
                ControllerName: $scope.block.label
            };
            fetch('/umbraco/api/CustomPreview/RenderPartial', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            }).then((response) => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Something went wrong');
            }).then(json => {
                $scope.$apply(function () {
                    $scope.html = json.html;
                });
            }).catch((error) => {
                console.log(error)
            });
        }
    }, true);

    setTimeout(() => {
        const data = {
            ScopeChange: JSON.stringify($scope.block.data),
            ControllerName: $scope.block.label
        };
        fetch('/umbraco/api/CustomPreview/RenderPartial', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then((response) => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Something went wrong');
        }).then(json => {
            $scope.html = json.html;
        }).catch((error) => {
            console.log(error)
        });
        
    }, 10)
});

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
