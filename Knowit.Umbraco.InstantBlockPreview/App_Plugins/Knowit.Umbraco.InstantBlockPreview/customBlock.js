angular.module("umbraco").controller("customBlockController", [
    '$scope',
    '$attrs',
    'editorState',
    'eventsService',
    function ($scope, $attrs, editorState) {
        const blockType = $attrs.blockType;
        let renderType = 'razor';
        let settings;
        let seed = "";
        const apiEndpoints = {
            renderPartial: '/umbraco/api/CustomPreview/RenderPartial',
            refreshAppComponent: '/umbraco/api/CustomPreview/RefreshAppComponent',
            getSettings: '/umbraco/api/CustomPreview/Settings'
        };

        fetch(apiEndpoints.getSettings).then(res => res.json()).then(data => {
            settings = data;
            renderType = settings.renderType;

            $scope.$watch('block.data', (newValue) => handleBlockDataChange(newValue, $scope.block.settingsData), true);
            $scope.$watch('block.settingsData', (newValue) => handleBlockDataChange($scope.block.data, newValue), true);
        });

        let appInitialized = false;


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

        function initApp(dataToFetch) {
            if (!appInitialized) {
                fetchData(apiEndpoints.renderPartial, dataToFetch)
                    .then(json => {
                        updateHtml(json);
                        seed = json.seed;
                        return fetchData(apiEndpoints.refreshAppComponent, dataToFetch);
                    })
                    .then(json => {

                        setTimeout(() => {
                            let event = new CustomEvent('event-' + seed, { detail: json.json });
                            window.dispatchEvent(event);
                        }, 200);
                        appInitialized = true;
                    })
                    .catch(error => console.log(error));
            }
            else {

                fetchData(apiEndpoints.refreshAppComponent, dataToFetch)
                    .then(json => {
                        let event = new CustomEvent('event-' + seed, { detail: json.json });
                        window.dispatchEvent(event);
                    })
                    .catch(error => console.log(error));
            }
        }

        function handleBlockDataChange(newValue, settingsData) {

            if (newValue) {
                const data = {
                    Content: JSON.stringify(newValue),
                    Settings: JSON.stringify(settingsData),
                    ControllerName: $scope.block.content.contentTypeAlias,
                    BlockType: blockType,
                    isApp: renderType === 'app',
                    contentId: editorState.getCurrent().id
                };

                renderType === 'app' ? initApp(data) : fetchData(apiEndpoints.renderPartial, data).then(updateHtml).catch(error => console.log(error));
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

                    const scripts = Array.from(element[0].getElementsByTagName("script"));

                    const injections = [];
                    scripts.forEach(function (oldScript) {
                        if (oldScript.src) {
                            injections.push({ src: oldScript.src, type: oldScript.getAttribute('type'), nomodule: oldScript.getAttribute('nomodule') });
                        }
                    });
                    console.log(injections)
                    scripts.forEach(function (oldScript) {
                        var scriptTag = document.createElement('script');
                        if (oldScript.src) {

                        } else {
                            const script = (oldScript.innerText || oldScript.textContent);
                            const r = (Math.floor(Math.random() * 100000) + 1).toString();
                            const funcName = `jsInjection_${r}`

                            // we wrap the inlined script in a function so it can be called with the element as a parameter
                            // we are faking a document so most scripts will keep running.
                            // randomly generated function name to avoid collisions
                            scriptTag.textContent = `
function ${funcName}(doc, scriptUrls, realDoc) {
    let document = doc.getRootNode();
    let scriptsToLoad = scriptUrls.length;

    try {
        scriptUrls.forEach(function(s) {
            let script = realDoc.createElement('script');
            
            script.src = s.src;
            script.type = s.type;
            script.nomodule = s.nomodule;
            
            script.onload = function() {
                scriptsToLoad--;
                
                if (scriptsToLoad === 0) {
                    ${script}
                }
            };
            
            script.onerror = function() {
                scriptsToLoad--;
                
                if (scriptsToLoad === 0) {
                    ${script}
                }
            };

            document.appendChild(script);
        });
    } catch (e${r}) {
        console.log(e${r})
        // Handle any exceptions if necessary
    }
}   
`;

                            oldScript.parentNode.replaceChild(scriptTag, oldScript);
                            
                            const el = element[0];
                            // create getELementById since that's normally only supported on document
                            window[funcName](el, injections, document);

                        }


                    });
                }
            });
        }
    };
});
