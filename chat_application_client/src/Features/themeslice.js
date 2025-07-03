import { createSlice } from "@reduxjs/toolkit";

function getInitialTheme() {
    const stored = localStorage.getItem("themeKey");
    if (stored !== null) return stored === "true";
    // Device default: true for light, false for dark
    return !window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const themeSlice = createSlice({
    name:'themeslice',
    initialState: getInitialTheme(),
    reducers:{
        toggleTheme:(state)=>{
            const newTheme = !state;
            localStorage.setItem("themeKey", newTheme);
            return newTheme;
        }
    }
})

export const {toggleTheme} = themeSlice.actions;
export default themeSlice.reducer;