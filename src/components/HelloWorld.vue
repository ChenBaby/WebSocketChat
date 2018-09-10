<template>
  <div class="hello">
    <h1>{{ msg }}{{totalNum}}</h1>
    <p class="checking-panel">
      <el-input type="text" placeholder='请输入名字' v-model.trim="name" class="chat-name"
      @keyup.enter.native='enterRoom' :autofocus="true" :readonly="comeined"/>
      <el-button v-on:click="enterRoom" v-show="!comeined">进入聊天室</el-button>
      <el-button v-on:click="leaveRoom" v-show='comeined'>离开聊天室</el-button>
    </p>
    <div>
      <p class="text-left">聊天室</p>
      <el-input name="chatting-box" id="chatting-panel" :readonly='true' type='textarea' v-model="messagesList" :autosize="{ minRows: 18, maxRows: 18}"></el-input>
      <p class="text-center">
        <el-input type="text" v-model="message" class="chat-content" @keyup.enter.native="sendContent" v-focus="comeined" />
        <el-button v-on:click="sendContent">发送</el-button>
      </p>
    </div>
  </div>
</template>

<script>

export default {
  name: 'HelloWorld',
  props: {
    msg: String
  },
  data: () => ({
    name: '',
    id: '',
    message: '',
    comeined: false,
    ws: null,
    totalNum: 0,
    messagesList: ''
  }),
  directives: {
    focus: {
      componentUpdated: function (el, {value}) {
        if (value) {
        /* 由于ElementUI中的el-input是一个自定义组件，并非input元素，所以需要传入组件的class和tag名称来定位组件内的原生input，并调用input的focus方法来获得焦点。 */
          el.querySelector('input').focus()
        /*
        在实际用focus指令的过程中，需要给元素添加blur事件： v-on:blur="变量=false"。失去焦点后一定要把focus指令对应的变量置为false，否则会导致一些不可控的bug。（本例子没有）
        */
        }
      }
    }
  },
  methods: {
    beforeunloadHandler: function (e) {
      var list = {
        name: this.name,
        id: this.id,
        type: '5'
      }
      this.ws.close(list)
    },
    enterRoom: function () {
      if (this.name) {
        this.initWebSocket()
      }
    },
    leaveRoom: function () {
      var list = {
        name: this.name,
        id: this.id,
        type: '4'
      }
      this.ws.send(JSON.stringify(list))
    },
    sendContent: function () {
      if (!this.message) {
        return false
      }
      var list = {
        name: this.name,
        id: this.id,
        message: this.message,
        type: '3'
      }
      this.ws.send(JSON.stringify(list))
      this.message = ''
    },
    initWebSocket: function () {
      var thisvue = this
      thisvue.ws = new WebSocket('ws://35.200.61.173:6060/')
      // thisvue.ws = new WebSocket('ws://localhost:6060/')
      var ws = thisvue.ws
      ws.onopen = function () {
        console.log('进入连接')
        var list = {
          name: thisvue.name,
          type: '2'
        }
        ws.send(JSON.stringify(list))
      }
      ws.onmessage = (evt) => {
        let data = JSON.parse(evt.data)
        console.log(data)
        this.totalNum = data.num
        switch (data.type) {
          case '1':
            this.id = data.id
            break
          case '2':
            var listmessage1 = `${data.name}进入聊天室\n`
            thisvue.messagesList += listmessage1
            thisvue.comeined = true
            break
          case '3':
            var listmessage2 = `${data.name}说：${data.message}\n`
            this.messagesList += listmessage2
            break
          case '4':
            var listmessage3 = `${data.name}离开聊天室\n`
            this.messagesList += listmessage3
            if (data.id === this.id) {
              thisvue.comeined = false
            }
            break
          case '5':
            var listmessage4 = `${data.name}离开聊天室\n`
            this.messagesList += listmessage4
            break
          default:
            var listmessage5 = '服务器连接错误，请重试\n'
            this.messagesList += listmessage5
        }
        // websocket 返回数据
      }
    }
  },
  mounted () {
    // window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
  },
  destroyed () {
    // window.removeEventListener('beforeunload', e => this.beforeunloadHandler(e))
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.text-left {
  text-align: left;
}
.text-center {
  text-align: center;
}
.checking-panel .el-input {
  width: 25%;
  margin-right: 10px;
}
.el-textarea {
  width: 100%;
}
.chat-content {
  width: 30%;
  margin-right: 10px;
}
</style>
