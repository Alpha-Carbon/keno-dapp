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
        <a href={`https://oracle-app.alphacarbon.network/verify/keno?address=${contract?.address}&block=${currentRoundResult?.round * rule?.drawRate.toNumber()}&round=${currentRoundResult?.round}&chainId=31337`}
          target="_blank"
          rel="noopener noreferrer">Verify</a>
      </div>
    </div>
  );
}

const BlurFilter = styled.div`
  filter: blur(8px);  
  -webkit-filter: blur(8px);
`

function Wrapper() {
  document.title = "Keno Game"
  const [
    { currentRoundResult, contract, totalLiabilities, rule, currentBlock, currentRound, winners },
    actions
  ] = useWeb3()
  const { controller, selecting, container } = useKeno()

  let keno = (<KenoContainer
    container={container}
    rule={rule}
    contract={contract}
    currentBlock={currentBlock}
    actions={actions}
    controller={controller}
    currentRoundResult={currentRoundResult}
  />)
  return (
    <WrapperView>
      <Web3Connect />
      <div className="game-container">
        <div>
          {actions.chainInit ? keno : (<BlurFilter>{keno}</BlurFilter>)}
          {/* #TODO seperate canvas controlling, make it purers */}
          <ResultDisplay
            currentRoundResult={currentRoundResult}
            rule={rule}
            currentBlock={currentBlock}
            totalLiabilities={totalLiabilities}
            contract={contract}
            keno={controller}
            selecting={selecting}
          />
        </div>

        <div className="current-round">
          <CurrentRoundPlayer round={currentRound} />
        </div>
      </div>

      <RoundWinner roundWinner={winners} />


    </WrapperView>
  )
}

const WrapperView = styled.div`
  background: rgb(51, 51, 51);
  color: #73DCFF;
  
  .game-container {
    display: flex;
    justify-content: space-between;
    width: 1140px;
    margin: auto;

    .keno-container {
      position: relative;
      width: 875px;
      height: 500px;

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

    .current-round {
      height: 470px;
      width: 250px;
      border-radius: 25px;
      background-color: white;
    }
  }

  

  .game-controller {
    position: absolute;
    bottom: 19%;
    left: 2%;
  }
`
export default App;
