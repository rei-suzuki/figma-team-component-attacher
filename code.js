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
        if (figma.command == "saveComponents") {
            yield figma.clientStorage.setAsync(clientStrageKey, yield saveComponents([figma.currentPage]));
        }
        else if (figma.command == "replaceNodes") {
            const teamLibraryComponents = yield figma.clientStorage.getAsync(clientStrageKey);
            yield scanNodes(figma.currentPage.selection, teamLibraryComponents);
        }
        figma.closePlugin();
    });
}
function saveComponents(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamLibraryMasterComponents = {};
        findComponent(teamLibraryMasterComponents, nodes);
        return teamLibraryMasterComponents;
    });
}
function findComponent(teamLibraryMasterComponents, nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const node of nodes) {
            if (node.type === "COMPONENT") {
                teamLibraryMasterComponents[node.name] = node.key;
            }
            if (node.children != null) {
                findComponent(teamLibraryMasterComponents, node.children);
            }
        }
    });
}
// 保存したComponent IDを使ってリプレイス
function scanNodes(nodes, teamLibraryComponents) {
    return __awaiter(this, void 0, void 0, function* () {
        for (const node of nodes) {
            if (node.type === "INSTANCE" || node.type === "FRAME" || node.type === "GROUP") {
                const key = teamLibraryComponents[node.name];
                if (key != undefined) {
                    if (node.type === "INSTANCE" && node.mainComponent.key === teamLibraryComponents[node.name]) {
                        continue;
                    }
                    yield replaceNode(node, key);
                }
                else {
                    scanNodes(node.children, teamLibraryComponents);
                }
            }
        }
    });
}
function replaceNode(node, key) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const teamLibraryComponent = yield figma.importComponentByKeyAsync(key);
            const teamLibrayComponentInstance = yield teamLibraryComponent.createInstance();
            const index = node.parent.children.findIndex((child) => child.id === node.id);
            node.parent.insertChild(index, teamLibrayComponentInstance);
            teamLibrayComponentInstance.x = node.x;
            teamLibrayComponentInstance.y = node.y;
            node.remove();
        }
        catch (e) {
            const error = e.toString();
            figma.notify(error);
        }
    });
}
main();
