var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (figma.command == "saveTargetComponent") {
            yield saveTargetComponent();
        }
        else if (figma.command == "replaceNodes") {
            yield replaceNodes();
        }
        figma.closePlugin();
    });
}
// ComponentFileのComponent IDを取得して保存
function saveTargetComponent() {
    return __awaiter(this, void 0, void 0, function* () {
        for (let i = 0; i < figma.currentPage.selection.length; i++) {
            let nodes = figma.currentPage.selection;
            yield figma.clientStorage.setAsync("key", nodes[i].key);
        }
        return true;
    });
}
// 保存したComponent IDを使ってリプレイス
function replaceNodes() {
    return __awaiter(this, void 0, void 0, function* () {
        const teamLibraryComponentKey = yield figma.clientStorage.getAsync("key");
        const teamLibraryMasterComponent = yield figma.importComponentByKeyAsync(teamLibraryComponentKey);
        const selections = figma.currentPage.selection;
        for (let i = 0; i < selections.length; i++) {
            if (selections[i].type === "INSTANCE") {
                selections[i].masterComponent = teamLibraryMasterComponent;
            }
        }
    });
}
main();
