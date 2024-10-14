import { configureStore } from "@reduxjs/toolkit";
import themesliceReducer from "./themeslice";
import refreshSidebar from "./refreshSidebar";
import authReducer from "./authotp"

export const store = configureStore({
    reducer:{
        themeKey : themesliceReducer,
        refreshKey:refreshSidebar,
        auth : authReducer,
    }
})