import {
    createRenderer,
    defineComponent,
    compile,
    RendererOptions
  } from 'vue'

  const { Line, Label, PrintDensity, Barcode, BarcodeType,BarcodeTypeName, PrintDensityName, Spacing, Text, FontFamily, FontFamilyName } = require('jszpl');

  const label = new Label();

  label.printDensity = new PrintDensity(PrintDensityName['8dpmm']);
  label.width = 100;
  label.height = 50;
  label.padding = new Spacing(10);

  class ZPLNode {
    id = (Math.random() * 10000).toFixed(0)
    parent?: string
    children: string[] = []
  }

  class ZPLTextNode extends ZPLNode {
    text: string
    constructor(value:string) {
        super()
        this.text = value
    }
  }



  class ZPLElement extends ZPLNode{}
  class ZPLTextElement extends ZPLElement{}
  class ZPLViewElement extends ZPLElement{}
  class ZPLDocumentElement extends ZPLElement{}
  class ZPLLineElement extends ZPLElement{
    x1: number
    y1: number
    x2:number
    y2:number
    thickness: number
    constructor(){
        super()
        this.x1 = 0
        this.y1 = 0
        this.x2 = 0
        this.y2 = 0
        this.thickness = 0
    }
  }
  class ZPLBarcodeElement extends ZPLElement{
    data: number
    constructor() {
        super()
        this.data =  0
    }
  }

  type ZPLNodes = ZPLTextNode
  type ZPLElements = ZPLTextElement | ZPLViewElement | ZPLDocumentElement | ZPLBarcodeElement | ZPLLineElement
  const App = defineComponent({
    render: compile(`
        <View>
            <Text>Some Text</Text>
            <Line :x1="50" :y1="50" :x2="100" :y2="75" :thickness="2" />
            <Line :x1="100" :y1="75" :x2="50" :y2="100" :thickness="2" />
        </View>
    `)
  })


function noop(fn: string): any {
  throw Error(`no-op: ${fn}`);
}
const nodeMap: Record<string, ZPLNodes | ZPLElements> = {}
const nodeOps: RendererOptions<ZPLNodes, ZPLElements> = {
  patchProp: (el, key, prevVal, nextVal) => {
    console.log("patchProp", { el, key, prevVal, nextVal });
    if (el instanceof ZPLBarcodeElement) {
        if(key === 'data') {
            el.data = nextVal
        }
    }

    if(el instanceof ZPLLineElement) {
        if(key === 'x1') {
            el.x1 = nextVal
        }
        if(key === 'y1') {
            el.y1 = nextVal
        }
        if(key === 'x2') {
            el.x2 = nextVal
        }
        if(key === 'y2') {
            el.y2 = nextVal
        }
        if(key === 'thickness') {
            el.thickness = nextVal
        }
    }
  },

  insert: (child, parent, anchor) => {
    if(parent instanceof ZPLDocumentElement) {
        parent.id = 'root'
        nodeMap['root'] = parent
    }
    if(!(child.id in nodeMap)) {
        nodeMap[child.id] = child
    }

    parent.children.push(child.id)
    child.parent = parent.id
    console.log("insert", { child, parent, anchor });

  },

  createElement: (tag) => {
    console.log(`createElement: ${tag}`);

    if (tag === 'View') {
        return new ZPLViewElement()
    }

    if (tag === 'Text') {
        return new ZPLTextElement()
    }

    if (tag === 'Barcode') {
        return new ZPLBarcodeElement()
    }

    if(tag === 'Line') {
        return new ZPLLineElement()
    }
    throw Error(`illegal tag ${tag}`)
  },

  createText: (text) => {
    console.log(`createText: ${text}`);
    return new ZPLTextNode(text)
  },

  parentNode: () => noop("parentNode"),
  createComment: () => noop("setText"),
  setText: () => noop("setText"),
  setElementText: () => noop("setElementText"),
  nextSibling: () => noop("nextSibling"),
  querySelector: () => noop("querySelector"),
  setScopeId: () => noop("setScopeId"),
  cloneNode: () => noop("cloneNode"),
  insertStaticContent: () => noop("insertStaticContent"),
  remove: () => noop("remove")
}
  
  const {createApp} = createRenderer(nodeOps)

  const app = createApp(App)
  const root = new ZPLDocumentElement
  app.mount(root)

  console.log(nodeMap)

  const draw = (node: ZPLNodes |ZPLElements) => {
    if(node instanceof ZPLTextNode) {
        const text =new Text()
        label.content.push(text)
        text.fontFamily = new FontFamily(FontFamilyName.D)
        text.text = node.text
    }
    if(node instanceof ZPLBarcodeElement) {
        label.padding = new Spacing(100);
        const barcode = new Barcode();

        barcode.type = new BarcodeType(BarcodeTypeName.Code11)
        barcode.data = node.data
        barcode.width = 100
        barcode.height =50
        label.content.push(barcode)
      
    }

    if(node instanceof ZPLLineElement) {
        const line = new Line();
        line.x1 = node.x1
        line.y1 = node.y1

        line.x2 = node.x2;
        line.y2 = node.y2;
        line.thickness = node.thickness

        label.content.push(line)
    }
  }

  const walk = (node: ZPLNodes | ZPLElements) => {
    if(node instanceof ZPLElement) {
        for (const child of node.children) {
            walk(nodeMap[child])
            draw(nodeMap[child])
        }
    }
  }

  walk(nodeMap['root'])

  const zpl =  label.generateZPL();
  console.log(zpl)