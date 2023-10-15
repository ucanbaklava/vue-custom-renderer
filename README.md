# Custom Vue Renderer Example

Vue renderer can target to any target platform, not just DOM. This is an example of how to create a custom vue renderer.

## Context

This custom renderer creates a ZPL string with the help of jszpl library. It is just a how-to not a full implementation.

```js
  const App = defineComponent({
    render: compile(`
        <View>
            <Text>Some Text</Text>
            <Line :x1="50" :y1="50" :x2="100" :y2="75" :thickness="2" />
            <Line :x1="100" :y1="75" :x2="50" :y2="100" :thickness="2" />
        </View>
    `)
  })

  --------------- RESULT ---------------

    ^XA
    ^FO10,10^AD,,,
    ^FB780,1000,0,L,0
    ^FDSome Text^FS
    ^FO60,60^GD50,25,2,B,L^FS
    ^FO60,85^GD50,25,2,B,L^FS
    ^XZ
```
