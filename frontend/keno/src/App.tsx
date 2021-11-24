import './App.css';
import KenoProvider from './keno/kenoProvider';
import Game from './components/game';
import ResultDisplay from './components/resultDisplay';
import Web3Connect from './components/Web3Connect'
import useWeb3, { Web3Provider } from './hooks/useWeb3'

function App() {
  return (
    <Web3Provider>
      <KenoProvider>
        <Wrapper />
      </KenoProvider>
    </Web3Provider>
  );
}

function Wrapper() {
  const [
    { currentRoundResult, contract, totalLiabilities, rule, currentBlock },
    actions
  ] = useWeb3()
  return (
    <>
      <Web3Connect />
      <ResultDisplay
        currentRoundResult={currentRoundResult}
        rule={rule}
        currentBlock={currentBlock}
        totalLiabilities={totalLiabilities}
        contract={contract}
      />
      <p>==============================</p>
      <Game
        contract={contract}
        currentBlock={currentBlock}
        readyToTransact={actions.ready} />
    </>
  )
}
export default App;
