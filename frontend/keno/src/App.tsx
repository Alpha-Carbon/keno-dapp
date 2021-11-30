import './App.css';
import React, { useEffect } from 'react'
import KenoProvider from './keno/kenoProvider';
import Game from './components/game';
import ResultDisplay from './components/resultDisplay';
import Web3Connect from './components/Web3Connect'
import useWeb3, { Web3Provider } from './hooks/useWeb3'
import { useKeno } from './hooks/useKeno'
import CurrentRoundPlayer from './components/currentRoundPlayer';
import RoundWinner from './components/roundWinner';

function App() {
  return (
    <Web3Provider>
      <KenoProvider>
        <Wrapper />
      </KenoProvider>
    </Web3Provider>
  );
}

interface KenoContainerProps {
  container: HTMLDivElement
}

const KenoContainer: React.FC<KenoContainerProps> = ({ container }) => {
  let c: HTMLDivElement | null;
  useEffect(() => {
    c!.appendChild(container);
  }, []);

  return (
    <div ref={node => c = node}>
    </div>
  );
}

function Wrapper() {
  const [
    { currentRoundResult, contract, totalLiabilities, rule, currentBlock, currentRound, winners },
    actions
  ] = useWeb3()
  const { controller, selecting, container } = useKeno()

  return (
    <>
      <Web3Connect />
      <KenoContainer container={container} />
      <ResultDisplay
        currentRoundResult={currentRoundResult}
        rule={rule}
        currentBlock={currentBlock}
        totalLiabilities={totalLiabilities}
        contract={contract}
        keno={controller}
        selecting={selecting}
      />
      <Game
        rule={rule}
        contract={contract}
        currentBlock={currentBlock}
        readyToTransact={actions.ready}
        keno={controller}
      />
      <CurrentRoundPlayer round={currentRound} />
      <RoundWinner roundWinner={winners} />
    </>
  )
}
export default App;
