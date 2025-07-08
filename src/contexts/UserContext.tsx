"use client";
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useReducer,
} from "react";

import { TDashboardGame } from "@/types/game.types";
import { TUser, TUserMessage } from "@/types/user.types";

interface State {
  user: TUser | null;
  favouriteGames: TDashboardGame[];
  weeklyPicks: TDashboardGame[];
  mostPlayed: TDashboardGame[];
  messages: TUserMessage[];
  readMessages: number[];
  slotMachineUrl: string;
}

const initialState: State = {
  user: null,
  favouriteGames: [],
  weeklyPicks: [],
  mostPlayed: [],
  messages: [],
  readMessages: [],
  slotMachineUrl: "",
};

type Action =
  | { type: "SET_USER"; payload: TUser | null }
  | { type: "SET_FAVOURITE_GAMES"; payload: TDashboardGame[] }
  | { type: "SET_WEEKLY_PICKS"; payload: TDashboardGame[] }
  | { type: "SET_MOST_PLAYED"; payload: TDashboardGame[] }
  | { type: "SET_MESSAGES"; payload: TUserMessage[] }
  | { type: "SET_READ_MESSAGES"; payload: number[] }
  | { type: "SET_SLOT_URL"; payload: string }
  | { type: "BATCH_UPDATE"; payload: Partial<State> };

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "SET_USER":
      return { ...state, user: action.payload };
    case "SET_FAVOURITE_GAMES":
      return { ...state, favouriteGames: action.payload };
    case "SET_WEEKLY_PICKS":
      return { ...state, weeklyPicks: action.payload };
    case "SET_MOST_PLAYED":
      return { ...state, mostPlayed: action.payload };
    case "SET_MESSAGES":
      return { ...state, messages: action.payload };
    case "SET_READ_MESSAGES":
      return { ...state, readMessages: action.payload };
    case "SET_SLOT_URL":
      return { ...state, slotMachineUrl: action.payload };
    case "BATCH_UPDATE":
      return {
        ...state,
        ...(action.payload.user !== undefined && { user: action.payload.user }),
        ...(action.payload.favouriteGames && {
          favouriteGames: action.payload.favouriteGames,
        }),
        ...(action.payload.weeklyPicks && {
          weeklyPicks: action.payload.weeklyPicks,
        }),
        ...(action.payload.mostPlayed && {
          mostPlayed: action.payload.mostPlayed,
        }),
        ...(action.payload.messages && { messages: action.payload.messages }),
        ...(action.payload.readMessages && {
          readMessages: action.payload.readMessages,
        }),
        ...(action.payload.slotMachineUrl && {
          slotMachineUrl: action.payload.slotMachineUrl,
        }),
      };
    default:
      return state;
  }
};

const UserContext = createContext<{
  state: State;
  dispatch: React.Dispatch<Action>;
  getUserProfile: () => Promise<TUser | null>;
  getUserFavouriteGames: () => Promise<TDashboardGame[]>;
}>({
  state: initialState,
  dispatch: () => null,
  getUserProfile: () => Promise.resolve(null),
  getUserFavouriteGames: () => Promise.resolve([]),
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState, (init) => {
    const savedUser =
      typeof window !== "undefined" ? localStorage.getItem("_user") : null;
    return {
      ...init,
      user: savedUser ? JSON.parse(savedUser) : null,
    };
  });

  const getUserProfile = async (): Promise<TUser | null> => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user/`
    );
    if (res.ok) {
      const userProfile = await res.json();
      dispatch({
        type: "SET_USER",
        payload: { ...userProfile, photo: userProfile.photo },
      });
      return userProfile;
    }
    return null;
  };

  // Fetch User Favourite Games
  const getUserFavouriteGames = async (): Promise<TDashboardGame[]> => {
    const userFavGamesRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard/user-games/`,
      {
        method: "GET",
      }
    );
    const userGames = await userFavGamesRes.json();
    dispatch({ type: "SET_FAVOURITE_GAMES", payload: userGames });
    return userGames;
  };

  // Persist user to localStorage
  useEffect(() => {
    if (state.user) {
      localStorage.setItem("_user", JSON.stringify(state.user));
    }
  }, [state.user]);

  return (
    <UserContext.Provider
      value={{ state, getUserProfile, getUserFavouriteGames, dispatch }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);

// Optional: cleaner actions
export const useUserActions = () => {
  const { dispatch } = useUser();

  return {
    setUser: (user: TUser | null) =>
      dispatch({ type: "SET_USER", payload: user }),
    setFavouriteGames: (games: TDashboardGame[]) =>
      dispatch({ type: "SET_FAVOURITE_GAMES", payload: games }),
    setWeeklyPicks: (games: TDashboardGame[]) =>
      dispatch({ type: "SET_WEEKLY_PICKS", payload: games }),
    setMostPlayed: (games: TDashboardGame[]) =>
      dispatch({ type: "SET_MOST_PLAYED", payload: games }),
    setMessages: (messages: TUserMessage[]) =>
      dispatch({ type: "SET_MESSAGES", payload: messages }),
    setReadMessages: (ids: number[]) =>
      dispatch({ type: "SET_READ_MESSAGES", payload: ids }),
    setSlotUrl: (url: string) =>
      dispatch({ type: "SET_SLOT_URL", payload: url }),
    setBatchUpdate: (payload: Partial<State>) =>
      dispatch({ type: "BATCH_UPDATE", payload }),
  };
};
