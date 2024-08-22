angular.module("umbraco").controller("customBlockController", [
    '$scope',
    '$attrs',
    '$element',
    'editorState',
    'eventsService',
    function ($scope, $attrs, $element, editorState) {
        const blockType = $attrs.blockType;
        let renderType = 'razor';
        $scope.enableBlockEdit = true;

        const collapsibleElement = $element.find('#collapsible')[0];
        const contentElement = $element.find('#contentDiv')[0];
        const collaps = collapsibleElement.querySelector('.collaps');

        const apiEndpoints = {
            renderPartial: '/umbraco/api/PreviewRendering/RenderComponent',
            settings: '/umbraco/api/PreviewRendering/Settings'
        };

        $scope.$watch('block.data', (newValue) => handleBlockDataChange(newValue, $scope.block.settingsData), true);
        $scope.$watch('block.settingsData', (newValue) => handleBlockDataChange($scope.block.data, newValue), true);

        fetch(apiEndpoints.settings).then(res => res.json()).then(json => {
            if (json.collapsibleBlocks) {
                collaps.addEventListener('click', function (e) {
                    collaps.classList.toggle('active');
                    contentElement.classList.toggle('visible');
                    e.preventDefault();
                });
            }
            else {
                collaps.classList.remove('collaps');
                collaps.innerHTML = null;
            }
        });



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

                const data = {
                    Content: stringify(newValue),
                    Settings: stringify(settingsData),
                    ControllerName: $scope.block.content.contentTypeAlias,
                    BlockType: blockType,
                    contentId: editorState.getCurrent().id
                };

                fetchData(apiEndpoints.renderPartial, data).then(updateHtml).catch(error => console.log(error));
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

                    htmlContent = htmlContent.replace('###renderGridAreaSlots', '<div class="renderGridAreaSlots">renderGridAreaSlots</div>');
                    console.log(scope);
                    element.html(htmlContent);

                    const renderGridAreaSlots = element[0].querySelector('.renderGridAreaSlots');
                    if (renderGridAreaSlots) {
                        const areaDiv = element[0].parentElement.querySelector('#areaDiv').firstElementChild;
                        renderGridAreaSlots.innerHTML = '';
                        renderGridAreaSlots.appendChild(areaDiv);
                    }

                    const scripts = Array.from(element[0].getElementsByTagName("script"));

                    const injections = [];
                    let needBootstrap = true;
                    scripts.forEach(function (oldScript) {
                        if (oldScript.src) {
                            injections.push({ src: oldScript.src, type: oldScript.getAttribute('type'), nomodule: oldScript.getAttribute('nomodule') });
                        }
                        else {
                            needBootstrap = false;

                        }
                    });

                    if (needBootstrap) {
                        const bootStrap = document.createElement('script');
                        scripts.push(bootStrap);
                    }

                    scripts.forEach(function (oldScript) {
                        var scriptTag = document.createElement('script');

                        if (!oldScript.src) {

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
            if(s.type)
                script.type = s.type;
            if(s.nomodule)
                script.nomodule = s.nomodule;
            script.onload = function() {
                scriptsToLoad--;
                
                if (scriptsToLoad === 0) {
                    ${script}
                }
            };
            
            document.appendChild(script);
        });

        if(scriptUrls.length == 0) {
            ${script}
        }
    } catch (e${r}) {
        console.log(e${r})
        // Handle any exceptions if necessary
    }
}   
`;

                            oldScript.parentNode.replaceChild(scriptTag, oldScript);

                            const el = element[0];

                            window[funcName](el, injections, document);
                        }
                    });
                }
            });
        }
    };
});
