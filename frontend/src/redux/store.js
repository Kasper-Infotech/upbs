import { configureStore } from "@reduxjs/toolkit";
import {useDispatch as useAppDispatch, useSelector as useAppSelector} from  "react-redux";
import {persistStore, persistReducer} from "redux-persist";
import  {rootPersistConfig,rootReducer} from "./rootReducer"
const store  = configureStore({
    reducer: persistReducer(rootPersistConfig,rootReducer),
    middleware: (getDefaultMiddleWare)=> getDefaultMiddleWare({
        serializableCheck: false,
        immutableCheck: false,
    })
})

const persistor = persistStore(store);
const {dispatch} = store;
const useSelector = useAppSelector;
const useDispatch =  ()=>useAppDispatch();

export {store, persistor, dispatch,useSelector, useDispatch}

// import { configureStore } from "@reduxjs/toolkit";
// import departmentReducer from "./slices/departmentSlice"
// import attendanceReducer from './slices/attendanceSlice';
// import holidaysReducer from './slices/holidaysSlice';
// import employeeReducer from './slices/employeeSlice'; 
// import personalInfoReducer from './slices/personalInfoSlice';
// import tasksReducer from './slices/tasksSlice';
// import userReducer from "./slices/userSlice";
// import loginReducer from "./slices/loginSlice"
// export const store = configureStore({
//     reducer:{
//         holidays: holidaysReducer,
//         personalInfo: personalInfoReducer,
//         tasks: tasksReducer,
//         department: departmentReducer,
//         login:loginReducer,
//         user:userReducer,
//         attendance:attendanceReducer,
//         employees:employeeReducer,
//     }
// })