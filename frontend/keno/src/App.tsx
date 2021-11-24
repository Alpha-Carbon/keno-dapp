import React from 'react';
import logo from './logo.svg';
import './App.css';
import KenoProvider from './keno/kenoProvider';
import InputPanel from './components/panel';
import ResultDisplay from './components/resultDisplay';
import Web3Connect from './components/Web3Connect'
import { Web3Provider } from './hooks/useWeb3'

function App() {
  return (
    <Web3Provider>
      <KenoProvider>
        <InputPanel />
        <ResultDisplay />
        <Web3Connect />
      </KenoProvider>
    </Web3Provider>
  );
}

export default App;
