export type SystemId = 'skeletal'|'muscular'|'arterial'|'venous'|'nervous'|'digestive'|'respiratory'|'urinary'|'reproductive'|'lymphatic'|'endocrine'|'integumentary'|'connective'|'sensory'|'cardiac';
export const SYSTEMS: {id:SystemId;name:string;color:string;description:string}[] = [
 {id:'skeletal',name:'Skeleton',color:'#e2d9ba',description:'Bones form the supporting framework of the body, protect organs, and provide attachment points for muscles. Their internal tissue also stores minerals and produces blood cells.'},
 {id:'muscular',name:'Muscles',color:'#a85b50',description:'Skeletal muscles generate movement by pulling on their attachments. Together with tendons, they move joints, stabilize posture, and produce heat.'},
 {id:'cardiac',name:'Heart',color:'#b96760',description:'The heart is a muscular pump with four chambers. Its valves direct blood forward through the pulmonary and systemic circuits.'},
 {id:'sensory',name:'Sensory organs',color:'#b0c8ce',description:'These structures contribute to special senses, including sight, hearing, and balance. Their specialized tissues detect stimuli and work with the nervous system to convey information.'},
 {id:'arterial',name:'Arteries',color:'#c05245',description:'The heart drives blood through the circulation. Arteries carry blood away from the heart to supply tissues or, in the pulmonary circuit, to the lungs.'},
 {id:'venous',name:'Veins',color:'#527c9f',description:'Veins return blood toward the heart. Superficial and deep networks collect blood from the tissues; the pulmonary veins bring oxygenated blood back from the lungs.'},
 {id:'nervous',name:'Nervous system',color:'#d8b565',description:'The brain, spinal cord, and peripheral nerves carry and process signals. They support sensation, movement, coordination, and automatic regulation of body functions.'},
 {id:'respiratory',name:'Respiratory',color:'#b98991',description:'The airways conduct air to the lungs, where oxygen and carbon dioxide move between air and blood. Breathing depends on pressure changes produced by respiratory muscles.'},
 {id:'digestive',name:'Digestive',color:'#b8916b',description:'The digestive tract breaks down food, absorbs nutrients and water, and moves waste onward. Accessory organs contribute bile and digestive enzymes.'},
 {id:'urinary',name:'Urinary',color:'#b47961',description:'The kidneys filter blood and regulate fluid, electrolyte, and acid–base balance. Urine travels through the ureters to the bladder and exits through the urethra.'},
 {id:'lymphatic',name:'Lymphatic',color:'#879f7c',description:'Lymphatic vessels return excess tissue fluid to the circulation. Lymph nodes and other lymphoid organs support immune surveillance and responses.'},
 {id:'endocrine',name:'Endocrine',color:'#c5a09a',description:'Endocrine organs release hormones into the blood to coordinate processes such as metabolism, growth, stress responses, and reproduction.'},
 {id:'reproductive',name:'Reproductive',color:'#bda098',description:'The male reproductive structures represented here contribute to sperm production, maturation, transport, and the production of sex hormones.'},
 {id:'integumentary',name:'Body surface',color:'#ba9b7d',description:'The body surface provides an outer anatomical reference. The integumentary system forms a protective barrier and contributes to sensation and temperature regulation.'},
 {id:'connective',name:'Connective tissue',color:'#aec3bb',description:'Cartilage, ligaments, and other connective tissues support, connect, and separate structures. Their roles include stabilizing joints and distributing mechanical loads.'},
];
export interface Part {id:string;name:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View = 'three-quarter'|'front'|'back'|'side';
export type Region = 'all'|'head'|'brain'|'spine'|'nerves';
export type Theme = 'light'|'dark';
export interface SceneState {inspectorOpen?:boolean;explode:number;region:Region;theme:Theme;visible:SystemId[];hidden:string[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[] = ['cardiac','sensory','skeletal','muscular','arterial','venous','nervous','respiratory','digestive','urinary','lymphatic','endocrine','reproductive','connective'];
// ---- Regional focus: everything above the neckline, or the brain and its vessels ----
export const HEAD_MIN_Y = 1.5;
const BRAIN_NAME = /cerebr|brain|mening|ventricl|choroid|thalam|hypothalam|hippocamp|amygdal|\bons\b|medulla|cerebell|corpus callosum|fornix|insula|internal capsule|nucleus|gyrus|lobe|lobule|colliculus|geniculate|commissure|habenula|mammillary|aqueduct|midbrain|peduncle|stria|lamina terminalis|tuber cinereum|septum of telenceph|interpeduncular|spinal cord|\bnerve\b|ganglion|plexus|carotid|\bvertebral\b|basilar|jugular|sinus|choroidal|communicating|pericallosal|callosal|striat|vermi|pontine|medullary|ophthalmic|tentorium|dura|arachnoid|pituitary|pineal/i;
export const isHeadPart=(p:Part)=>p.bounds[0][1]>=HEAD_MIN_Y;
export const isBrainPart=(p:Part)=>isHeadPart(p)&&(p.system==='nervous'||BRAIN_NAME.test(p.name));
// The vertebral column: vertebrae and discs from C1 to the sacrum, the paraspinal muscles and the vessels that run with them.
const SPINE_INC=/vertebr|intervertebral|^atlas$|^axis$|sacrum|coccyx|spinal cord|central canal|vertebral artery|spinal artery|sacral vein|interspinal|intertransversar|rotator|semispinalis|multifidus|spinalis/i;
const SPINE_EXC=/coccygeus|iliococcygeus|pubococcygeus|deltoid|levator|longus|thyrocervical|costocervical|transverse cervical|superficial cervical|deep cervical/i;
export const isSpinePart=(p:Part)=>SPINE_INC.test(p.name)&&!SPINE_EXC.test(p.name);
export const inRegion=(p:Part,r:Region)=>r==='all'?true:r==='head'?isHeadPart(p):r==='brain'?isBrainPart(p):r==='spine'?isSpinePart(p):p.system==='nervous';
export const REGIONS:{id:Region;label:string;hint:string}[]=[
 {id:'all',label:'All',hint:'Show the whole body'},
 {id:'head',label:'Head',hint:'Everything above the neckline: skull, brain, face, eyes, teeth, vessels'},
 {id:'brain',label:'Brain',hint:'The brain, cranial nerves and the vessels that supply them'},
 {id:'spine',label:'Spine',hint:'Vertebrae C1 to sacrum, every disc, the paraspinal muscles and their vessels'},
 {id:'nerves',label:'Nerves',hint:'Every modelled nerve, ganglion and plexus (this atlas models these in the head and neck only)'},
];
// ---- Scene palette per theme: background, studio floor and lighting ----
export const SCENE_PALETTE:Record<Theme,{clear:string;ground:number;platform:number;ring:number;ringOpacity:number;innerRing:number;innerOpacity:number;hemiSky:number;hemiGround:number;hemiIntensity:number;marker:number;exposure:number}> = {
 light:{clear:'#f2f3f3',ground:0xd5d9dc,platform:0xeeeeec,ring:0x8c969f,ringOpacity:.4,innerRing:0xa4aeb8,innerOpacity:.16,hemiSky:0xffffff,hemiGround:0xa7acb2,hemiIntensity:1.05,marker:0x64748b,exposure:1.12},
 dark:{clear:'#0e1116',ground:0x151b22,platform:0x1b222b,ring:0x3a4756,ringOpacity:.55,innerRing:0x2c3743,innerOpacity:.3,hemiSky:0xb9c6d4,hemiGround:0x1a2027,hemiIntensity:.9,marker:0x9fb0c0,exposure:1.28},
};
export const EXPLANATIONS:Record<string,string> = {
 'heart':'A muscular pump in the chest. Its right side sends blood to the lungs; its left side sends blood through the systemic circulation.',
 'liver':'A large organ beneath the right side of the diaphragm. It processes absorbed nutrients, produces bile, and synthesizes many proteins carried in the blood.',
 'brain':'The central organ of the nervous system. Its interconnected regions support perception, movement, memory, language, and the regulation of bodily functions.',
 'stomach':'A muscular chamber between the esophagus and small intestine. It stores and mixes food with acid and enzymes before releasing it into the duodenum.',
 'spleen':'A lymphoid organ in the upper left abdomen. It filters blood, removes aging blood cells, and participates in immune responses.',
 'pancreas':'An abdominal organ with digestive and endocrine roles. It supplies enzymes to the small intestine and releases hormones including insulin and glucagon.',
 'urinary bladder':'A muscular reservoir in the pelvis that stores urine arriving from the kidneys through the ureters.',
 'trachea':'The main airway connecting the larynx to the bronchi. Its cartilage supports keep the airway open during breathing.',
 'diaphragm':'A broad muscle separating the chest and abdomen. When it contracts, it increases chest volume and helps draw air into the lungs.',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[name.toLowerCase()] ?? SYSTEMS.find(s=>s.id===system)?.description ?? '';}
