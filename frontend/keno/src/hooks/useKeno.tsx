import { KenoContext, KenoContextType } from '../keno/kenoContext'
import { useContext } from 'react';

export function useKeno(): KenoContextType {
    return useContext(KenoContext);
}
