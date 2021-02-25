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
            yield saveTargetComponent([figma.currentPage]);
        }
        else if (figma.command == "replaceNodes") {
            yield replaceNodes(figma.currentPage.selection);
        }
        figma.closePlugin();
    });
}
// ComponentFileのComponent IDを取得して保存
const teamLibraryMasterComponents = {};
function saveTargetComponent(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].type === "COMPONENT" || nodes[i].type === "COMPONENTSET") {
                teamLibraryMasterComponents[nodes[i].name] = nodes[i].key;
            }
            if (nodes[i].children != null) {
                saveTargetComponent(nodes[i].children);
            }
            if (nodes[i].children === null) {
                return false;
            }
        }
        yield figma.clientStorage.setAsync(clientStrageKey, teamLibraryMasterComponents);
    });
}
// 保存したComponent IDを使ってリプレイス
function replaceNodes(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamLibraryComponents = yield figma.clientStorage.getAsync(clientStrageKey);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].type === "FRAME" || nodes[i].type === "INSTANCE") {
                const key = teamLibraryComponents[nodes[i].name];
                const getTeamLibraryComponent = yield figma.importComponentByKeyAsync(key);
                const teamLibrayComponentInstance = yield getTeamLibraryComponent.createInstance();
                nodes[i].parent.insertChild(1, teamLibrayComponentInstance);
                //indexの1はまだ適当に入れてるだけ
                teamLibrayComponentInstance.x = nodes[i].x;
                teamLibrayComponentInstance.y = nodes[i].y;
                nodes[i].remove();
            }
        }
    });
}
main();
