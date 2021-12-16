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
import styled from 'styled-components'

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
  rule: any
  contract: any
  currentBlock: any
  actions: any
  controller: any
}

const KenoContainer: React.FC<KenoContainerProps> = ({ container, rule, contract, actions, currentBlock, controller }) => {
  let c: HTMLDivElement | null;
  useEffect(() => {
    c!.appendChild(container);
  }, []);

  return (
    <div ref={node => c = node} className="keno-container">
      <Game
        rule={rule}
        contract={contract}
        currentBlock={currentBlock}
        readyToTransact={actions.ready}
        keno={controller}
        className="game-controller"
      />
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
    <WrapperView>
      <Web3Connect />
      <KenoContainer
        container={container}
        rule={rule}
        contract={contract}
        currentBlock={currentBlock}
        actions={actions}
        controller={controller}
      />
      <ResultDisplay
        currentRoundResult={currentRoundResult}
        rule={rule}
        currentBlock={currentBlock}
        totalLiabilities={totalLiabilities}
        contract={contract}
        keno={controller}
        selecting={selecting}
      />
      <CurrentRoundPlayer round={currentRound} />
      <RoundWinner roundWinner={winners} />
    </WrapperView>
  )
}

const WrapperView = styled.div`
  background: rgb(51, 51, 51);
  color: #73DCFF;

  .keno-container {
    position: relative;
    width: 80vw;
    margin: auto;
  }

  .game-controller {
    position: absolute;
    bottom: 16%;
    left: 3%;
  }
`
export default App;
