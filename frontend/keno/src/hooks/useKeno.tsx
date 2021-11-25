import { KenoContextType } from '../keno/kenoType'
import { KenoContext } from '../keno/kenoProvider'
import { useContext } from 'react';

export function useKeno(): KenoContextType {
    return useContext(KenoContext);
}
