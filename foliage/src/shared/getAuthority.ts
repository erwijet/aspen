import { Authority } from "trunk-proto/trunk";
import localstorage from "./helpers/localstorage";

export function getAuthority() {
    const jwt = localstorage.authority.get();
    if (jwt == null) return null;
    else return Authority.create({ jwt });
}