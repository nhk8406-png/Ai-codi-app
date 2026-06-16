import { useReducer, useEffect, useCallback, useRef } from 'react';

const STAGES = ['egg', 'baby', 'child', 'teen', 'adult', 'elder'];
const STAGE_AGE = [0, 3, 8, 20, 40, 70]; // minutes

const INITIAL_STATE = {
  hunger: 80,
  happiness: 80,
  energy: 80,
  health: 100,
  weight: 5,
  age: 0,
  stage: 0,
  isSleeping: false,
  isSick: false,
  poopCount: 0,
  isAlive: true,
  isDead: false,
  ticks: 0,
  message: '다마고치가 태어났어요! 🎉',
  messageTimer: 3,
};

function reducer(state, action) {
  if (!state.isAlive && action.type !== 'RESET') return state;

  switch (action.type) {
    case 'TICK': {
      if (state.isSleeping) {
        const energy = Math.min(100, state.energy + 2);
        const hunger = Math.max(0, state.hunger - 0.3);
        const newTicks = state.ticks + 1;
        const ageMinutes = newTicks / 60;
        const newStage = STAGE_AGE.reduce((acc, t, i) => (ageMinutes >= t ? i : acc), 0);
        return {
          ...state,
          energy,
          hunger,
          ticks: newTicks,
          age: ageMinutes,
          stage: newStage,
          messageTimer: Math.max(0, state.messageTimer - 1),
        };
      }

      const newTicks = state.ticks + 1;
      const ageMinutes = newTicks / 60;
      const newStage = STAGE_AGE.reduce((acc, t, i) => (ageMinutes >= t ? i : acc), 0);

      let hunger = Math.max(0, state.hunger - 0.5);
      let happiness = Math.max(0, state.happiness - 0.3);
      let energy = Math.max(0, state.energy - 0.4);
      let health = state.health;
      let poopCount = state.poopCount;
      let isSick = state.isSick;

      if (hunger < 20) health = Math.max(0, health - 0.5);
      if (happiness < 20) health = Math.max(0, health - 0.3);
      if (energy < 10) health = Math.max(0, health - 0.3);
      if (poopCount >= 3) health = Math.max(0, health - 0.5);

      if (newTicks % 120 === 0) poopCount += 1;
      if (newTicks % 300 === 0 && Math.random() < 0.1) isSick = true;

      const isAlive = health > 0;

      return {
        ...state,
        hunger,
        happiness,
        energy,
        health,
        poopCount,
        isSick,
        isAlive,
        isDead: !isAlive,
        ticks: newTicks,
        age: ageMinutes,
        stage: newStage,
        messageTimer: Math.max(0, state.messageTimer - 1),
      };
    }

    case 'FEED_MEAL': {
      const hunger = Math.min(100, state.hunger + 25);
      const weight = Math.min(30, state.weight + 2);
      const happiness = Math.max(0, state.happiness - 5);
      return { ...state, hunger, weight, happiness, message: '냠냠 맛있다! 🍱', messageTimer: 3 };
    }

    case 'FEED_SNACK': {
      const hunger = Math.min(100, state.hunger + 8);
      const happiness = Math.min(100, state.happiness + 10);
      const weight = Math.min(30, state.weight + 1);
      return { ...state, hunger, happiness, weight, message: '달콤해! 🍬', messageTimer: 3 };
    }

    case 'PLAY': {
      if (state.energy < 20) {
        return { ...state, message: '너무 피곤해요... 😴', messageTimer: 3 };
      }
      const happiness = Math.min(100, state.happiness + 25);
      const hunger = Math.max(0, state.hunger - 10);
      const energy = Math.max(0, state.energy - 15);
      const weight = Math.max(1, state.weight - 1);
      return { ...state, happiness, hunger, energy, weight, message: '신나게 놀았어요! 🎮', messageTimer: 3 };
    }

    case 'TOGGLE_SLEEP': {
      if (state.isSleeping) {
        return { ...state, isSleeping: false, message: '잘 잤어요! 😊', messageTimer: 3 };
      }
      return { ...state, isSleeping: true, message: '쿨쿨... 💤', messageTimer: 3 };
    }

    case 'CLEAN': {
      if (state.poopCount === 0) {
        return { ...state, message: '이미 깨끗해요! ✨', messageTimer: 3 };
      }
      const happiness = Math.min(100, state.happiness + 15);
      return { ...state, poopCount: 0, happiness, message: '깨끗해졌어요! 🛁', messageTimer: 3 };
    }

    case 'MEDICINE': {
      if (!state.isSick) {
        return { ...state, message: '건강해요! 💊 필요없어요', messageTimer: 3 };
      }
      const health = Math.min(100, state.health + 30);
      const happiness = Math.max(0, state.happiness - 10);
      return { ...state, isSick: false, health, happiness, message: '이제 다 나았어요! 💊', messageTimer: 3 };
    }

    case 'LIGHTS': {
      return { ...state, isSleeping: !state.isSleeping, message: state.isSleeping ? '기상! ☀️' : '잘 자요! 🌙', messageTimer: 3 };
    }

    case 'RESET': {
      return { ...INITIAL_STATE, message: '새로운 친구가 왔어요! 🥚', messageTimer: 5 };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      dispatch({ type: 'TICK' });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const feed = useCallback((type) => dispatch({ type: type === 'meal' ? 'FEED_MEAL' : 'FEED_SNACK' }), []);
  const play = useCallback(() => dispatch({ type: 'PLAY' }), []);
  const toggleSleep = useCallback(() => dispatch({ type: 'TOGGLE_SLEEP' }), []);
  const clean = useCallback(() => dispatch({ type: 'CLEAN' }), []);
  const medicine = useCallback(() => dispatch({ type: 'MEDICINE' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  const stageName = STAGES[state.stage];

  return { state, stageName, feed, play, toggleSleep, clean, medicine, reset };
}
