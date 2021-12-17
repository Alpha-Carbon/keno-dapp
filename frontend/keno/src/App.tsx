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
  currentRoundResult: any
}

const KenoContainer: React.FC<KenoContainerProps> = ({ container, rule, contract, actions, currentBlock, controller, currentRoundResult }) => {
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
      <div className="verify-btn">
        <a href={`https://oracle-app.alphacarbon.network/verify/keno?address=0x53b96c552Ac100Ca97a2723255470E8549D2401b&block=${currentBlock}&round=${currentRoundResult?.round}&chainId=31337`}>Verify</a>
      </div>
    </div>
  );
}

function Wrapper() {
  document.title="Keno Game"
  const [
    { currentRoundResult, contract, totalLiabilities, rule, currentBlock, currentRound, winners },
    actions
  ] = useWeb3()
  const { controller, selecting, container } = useKeno()

  return (
    <WrapperView>
      <Web3Connect />
      <div className="game-container">
        <KenoContainer
          container={container}
          rule={rule}
          contract={contract}
          currentBlock={currentBlock}
          actions={actions}
          controller={controller}
          currentRoundResult={currentRoundResult}
        />
        <div className="result-container">
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
        </div>
        
      </div>
      
    </WrapperView>
  )
}

const WrapperView = styled.div`
  background: rgb(51, 51, 51);
  color: #73DCFF;
  height: 100vh;
  
  .game-container {
    display: flex;
    justify-content: center;
    align-items: center;

    position: relative;
    top: 50%;
    transform: translateY(-50%);

    .keno-container {
      position: relative;
      width: 65%;
      margin: auto;

      .verify-btn {
        position: absolute;
        bottom: 60%;
        left: 12%;
        padding: 5px 10px;
        background-color: white;

        a {
          text-decoration: none;
          color: black;
        }
      }
    }

    .result-container {
      width: 30%;
    }
  }

  

  .game-controller {
    position: absolute;
    bottom: 16%;
    left: 3%;
  }
`
export default App;
