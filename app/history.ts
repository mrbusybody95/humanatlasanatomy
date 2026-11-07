import {useCallback,useEffect,useRef,useState} from 'react';

/**
 * Undo/redo for the anatomy viewer.
 *
 * The atlas keeps its entire editable state in one small, pure object
 * (`visible`, `hidden`, `selected`, `isolate`, `region`, `view`, `explode`,
 * `rotate`, `reset`, `theme`). Arrays are replaced, never mutated, so a
 * snapshot is a shallow copy — a couple hundred bytes in practice.
 *
 * We deliberately snapshot whole state instead of inverting individual
 * commands: `selected` and `isolate` are one logical unit, and a snapshot can
 * never drift out of sync with what the scene is showing.
 *
 * Undo/redo never rebuilds geometry or refetches a model chunk — `scene.tsx`
 * only builds on `[atlas]`, so restoring a snapshot re-applies `.visible` on
 * meshes that already exist.
 */

export type Updater<T>=(previous:T)=>T;

/** Changes in this set arrive as a burst (slider drag) and must coalesce. */
const CONTINUOUS:ReadonlySet<string>=new Set(['explode','view']);

/** `theme` is a stored preference, not anatomy — it is never recorded. */
const IGNORED:string='theme';

const LIMIT=50;
const BURST_MS=350;

/** True when every recorded key belongs to the continuous (drag) set. */
export function isBurst(keys:string[]):boolean{
  const anatomy=keys.filter(key=>key!==IGNORED);
  return anatomy.length>0&&anatomy.every(key=>CONTINUOUS.has(key));
}

/**
 * A burst inside BURST_MS replaces the previous snapshot instead of pushing a
 * new one — so one slider drag costs exactly one undo, never one per pixel.
 */
export function shouldMerge(keys:string[],now:number,lastBurstAt:number):boolean{
  return isBurst(keys)&&now-lastBurstAt<BURST_MS;
}

/** Number of history steps kept. */
export const HISTORY_LIMIT=LIMIT;

export function changedKeys<T extends object>(previous:T,next:T):string[]{
  const keys:string[]=[];
  for(const key of Object.keys(next) as (keyof T)[]){
    if(!Object.is(previous[key],next[key])) keys.push(String(key));
  }
  return keys;
}

export type AnatomyHistory<T>={
  state:T;
  commit:(value:T|Updater<T>)=>void;
  undo:()=>void;
  redo:()=>void;
  canUndo:boolean;
  canRedo:boolean;
};

export function useAnatomyHistory<T extends object>(seed:T):AnatomyHistory<T>{
  const [state,setState]=useState<T>(seed);
  const [canUndo,setCanUndo]=useState(false);
  const [canRedo,setCanRedo]=useState(false);

  const past=useRef<T[]>([]);
  const future=useRef<T[]>([]);
  const current=useRef<T>(seed);
  const lastBurstAt=useRef(0);

  const sync=useCallback(()=>{
    setCanUndo(past.current.length>0);
    setCanRedo(future.current.length>0);
  },[]);

  const record=useCallback((snapshot:T)=>{
    past.current.push(snapshot);
    if(past.current.length>LIMIT) past.current.shift();
  },[]);

  const commit=useCallback((value:T|Updater<T>)=>{
    const previous=current.current;
    const next=typeof value==='function'?(value as Updater<T>)(previous):value;
    if(Object.is(next,previous)) return;

    const keys=changedKeys(previous,next);
    const anatomy=keys.filter(key=>key!==IGNORED);

    current.current=next;
    setState(next);

    // A theme flip must not create a history entry, nor clear the redo stack.
    if(anatomy.length===0) return;

    const now=Date.now();
    const burst=isBurst(keys);
    const merge=shouldMerge(keys,now,lastBurstAt.current);

    if(!merge) record(previous);

    future.current=[];
    lastBurstAt.current=burst?now:0;
    sync();
  },[record,sync]);

  const undo=useCallback(()=>{
    const previous=past.current.pop();
    if(!previous) return;
    future.current.push(current.current);
    current.current=previous;
    lastBurstAt.current=0;
    setState(previous);
    sync();
  },[sync]);

  const redo=useCallback(()=>{
    const next=future.current.pop();
    if(!next) return;
    record(current.current);
    current.current=next;
    lastBurstAt.current=0;
    setState(next);
    sync();
  },[record,sync]);

  // Ctrl/Cmd+Z and Ctrl/Cmd+Shift+Z (or Ctrl+Y). Bound once: the handlers only
  // touch refs and stable setters, so they never go stale.
  useEffect(()=>{
    const onKeyDown=(event:KeyboardEvent)=>{
      if(!event.ctrlKey&&!event.metaKey) return;
      const target=event.target as HTMLElement|null;
      if(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement||target?.isContentEditable) return;

      const key=event.key.toLowerCase();
      if(key==='z'&&!event.shiftKey){
        event.preventDefault();
        undo();
      }else if((key==='z'&&event.shiftKey)||key==='y'){
        event.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown',onKeyDown);
    return ()=>window.removeEventListener('keydown',onKeyDown);
  },[undo,redo]);

  return {state,commit,undo,redo,canUndo,canRedo};
}
