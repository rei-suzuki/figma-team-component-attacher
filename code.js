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
            yield saveTargetComponent();
        }
        else if (figma.command == "replaceNodes") {
            yield replaceNodes(figma.currentPage.selection);
        }
        figma.closePlugin();
    });
}
// ComponentFileのComponent IDを取得して保存
const teamLibraryMasterComponents = [];
function saveTargetComponent() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < figma.currentPage.selection.length; i++) {
            let nodes = figma.currentPage.selection;
            teamLibraryMasterComponents.push(new MasterComponent(nodes[i].name, nodes[i].key));
            yield figma.clientStorage.setAsync(clientStrageKey, teamLibraryMasterComponents);
        }
        return true;
    });
}
// 保存したComponent IDを使ってリプレイス
function replaceNodes(nodes) {
    return __awaiter(this, void 0, void 0, function* () {
        const teamLibraryComponents = yield figma.clientStorage.getAsync(clientStrageKey);
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].type === "FRAME" || nodes[i].type === "INSTANCE") {
                const findComponentName = teamLibraryComponents.find((v) => v.name === nodes[i].name);
                const getTeamLibraryComponent = yield figma.importComponentByKeyAsync(findComponentName.key);
                const teamLibrayComponentInstance = getTeamLibraryComponent.createInstance();
                nodes[i].parent.insertChild(1, teamLibrayComponentInstance);
                //indexの1はまだ適当に入れてるだけ
                nodes[i].remove();
            }
        }
    });
}
class MasterComponent {
    constructor(name, key) {
        this.name = name;
        this.key = key;
    }
}
main();
