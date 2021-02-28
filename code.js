var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const clientStrageKey = 'team-library-components';
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (figma.command == "saveTargetComponent") {
            yield figma.clientStorage.setAsync(clientStrageKey, yield saveTargetComponent([figma.currentPage]));
        }
        else if (figma.command == "replaceNodes") {
            const teamLibraryComponents = yield figma.clientStorage.getAsync(clientStrageKey);
            yield replaceNodes(figma.currentPage.selection, teamLibraryComponents);
        }
        figma.closePlugin();
    });
}
function saveTargetComponent(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamLibraryMasterComponents = {};
        findComponent(teamLibraryMasterComponents, nodes);
        return teamLibraryMasterComponents;
    });
}
function findComponent(teamLibraryMasterComponents, nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        const targetNode = [];
        for (const node of nodes) {
            if (node.type === "COMPONENT" || node.type === "COMPONENT_SET") {
                teamLibraryMasterComponents[node.name] = node.key;
            }
            if (node.children != null) {
                findComponent(teamLibraryMasterComponents, node.children);
            }
            if (node.children === null) {
                return false;
            }
        }
    });
}
// 保存したComponent IDを使ってリプレイス
function replaceNodes(nodes, teamLibraryComponents) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].type === "INSTANCE" || nodes[i].type === "FRAME") {
                const key = teamLibraryComponents[nodes[i].name];
                if (key != undefined) {
                    try {
                        const getTeamLibraryComponent = yield figma.importComponentByKeyAsync(key);
                        const teamLibrayComponentInstance = yield getTeamLibraryComponent.createInstance();
                        const index = nodes[i].parent.children.findIndex((child) => child.id === nodes[i].id);
                        nodes[i].parent.insertChild(index, teamLibrayComponentInstance);
                        teamLibrayComponentInstance.x = nodes[i].x;
                        teamLibrayComponentInstance.y = nodes[i].y;
                        nodes[i].remove();
                    }
                    catch (e) {
                        figma.notify(e);
                    }
                }
                else {
                    replaceNodes(nodes[i].children, teamLibraryComponents);
                }
            }
            else if (nodes[i].children != null) {
                replaceNodes(nodes[i].children, teamLibraryComponents);
            }
            else if (nodes[i].children === null) {
                return false;
            }
        }
    });
}
main();
