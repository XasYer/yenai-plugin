import plugin from '../../../lib/plugins/plugin.js'
import os from 'os';
import { Version, Common, Plugin_Name, Data } from '../components/index.js'
import CPU from '../model/cpu.js';
export class example extends plugin {
  constructor() {
    super({
      name: '状态',
      dsc: '状态',
      event: 'message',
      priority: 50,
      rule: [
        {
          reg: '^#?(椰奶)?状态$',
          fnc: 'state'
        }
      ]

    })
  }


  async state(e) {
    if (!/椰奶/.test(e.msg) && !await redis.get("yenai:notice:state")) {
      return false;
    }

    let portrait = `https://q1.qlogo.cn/g?b=qq&s=0&nk=${Bot.uin}`
    //cpu使用率
    let cpu_info = await CPU.getCPUUsage()
    //内存使用率
    let MemUsage = (1 - os.freemem() / os.totalmem()).toFixed(2)
    //空闲内存
    let freemem = CPU.getfilesize(os.freemem())

    //使用内存
    let Usingmemory = CPU.getfilesize((os.totalmem() - os.freemem()))
    //nodejs占用
    let nodeoccupy = CPU.getmemory();
    let node = Circle(nodeoccupy.occupy)
    let [node_leftCircle, node_rightCircle] = node
    //cpu
    let cpu = Circle(cpu_info)
    let [cpu_leftCircle, cpu_rightCircle] = cpu
    //ram
    let ram = Circle(MemUsage)
    let [ram_leftCircle, ram_rightCircle] = ram
    //最大mhz
    let maxspeed = CPU.getmaxspeed()
    //核心
    let hx = os.cpus()
    //群数
    let group_quantity = Array.from(Bot.gl.values()).length
    //好友数
    let friend_quantity = Array.from(Bot.fl.values()).length
    //登录设备
    let platform = {
      "1": "安卓手机",
      "2": "aPad",
      "3": "安卓手表",
      "4": "MacOS",
      "5": "iPad"
    }
    let status = {
      "31": "离开",
      "50": "忙碌",
      "70": "请勿打扰",
      "41": "隐身",
      "11": "我在线上",
      "60": "Q我吧",
    };
    let data = {
      //路径
      tplFile: `./plugins/yenai-plugin/resources/state/state.html`,
      //头像
      portrait,
      //运行时间
      runTime: await statusTime(),
      //版本
      version: Version.ver,
      //地址
      dz: process.cwd(),
      //昵称
      nickname: Bot.nickname,
      //系统运行时间
      systime: Formatting(),
      //收
      recv: Bot.statistics.recv_msg_cnt,
      //发
      sent: await redis.get(`Yz:count:sendMsg:total`) || 0,
      //cpu占比
      cpu_leftCircle,
      cpu_rightCircle,
      cpu_info: parseInt(cpu_info * 100) + "%",
      //核心
      hx: hx.length + "核",
      hxmodel: hx[0].model.substr(0, 3) || "",
      //最大MHZ
      maxspeed,
      //系统名
      hostname: os.type(),
      //内存使用率
      ram_leftCircle,
      ram_rightCircle,
      MemUsage: parseInt(MemUsage * 100) + "%",
      //空闲内存
      freemem,
      //已用内存
      Usingmemory,
      //nodejs版本
      nodeversion: process.version,
      //nodejs占用
      node_leftCircle,
      node_rightCircle,
      nodeoccupy,
      node_info: parseInt(nodeoccupy.occupy * 100) + "%",
      //群数
      group_quantity,
      //好友数
      friend_quantity,
      //登陆设备
      platform: platform[Bot.config.platform],
      //在线状态
      status: status[Bot.status]
    }
    //渲染图片
    await Common.render('state/state', {
      ...data,
    }, {
      e,
      scale: 2.0
    })
  }


}

/**运行时间 */
async function statusTime() {
  let present = new Date().getTime() / 1000
  let runTime = getsecond(present - Bot.stat.start_time, true)

  let { second, minute, hour } = runTime

  return hour + ":" + minute + ":" + second
}


function Formatting() {
  let time = getsecond(os.uptime(), true)
  let { second, minute, hour, day } = time

  return day + "天 " + hour + ":" + minute + ":" + second

}

/**圆形进度条渲染 */
function Circle(res) {
  let num = (res * 360).toFixed(0)
  let leftCircle = `style=transform:rotate(-180deg)`;
  let rightCircle;
  if (num > 180) {
    leftCircle = `style=transform:rotate(${num}deg)`
  } else {
    rightCircle = `style=transform:rotate(-${180 - num}deg)`;
  }
  return [leftCircle, rightCircle]
}

/*转换秒*/
function getsecond(time, repair) {
  let second = parseInt(time)
  let minute = 0
  let hour = 0
  let day = 0
  //  如果秒数大于60，将秒数转换成整数
  if (second > 60) {
    //  获取分钟，除以60取整数，得到整数分钟
    minute = parseInt(second / 60)
    //  获取秒数，秒数取佘，得到整数秒数
    second = parseInt(second % 60)
  }
  //  如果分钟大于60，将分钟转换成小时
  if (minute > 60) {
    //  获取小时，获取分钟除以60，得到整数小时
    hour = parseInt(minute / 60)
    //  获取小时后取佘的分，获取分钟除以60取佘的分
    minute = parseInt(minute % 60)
  }
  //  如果小时大于24，将小时转换成天
  if (hour > 23) {
    //  获取天数，获取小时除以24，得到整天数
    day = parseInt(hour / 24)
    //  获取天数后取余的小时，获取小时除以24取余的小时
    hour = parseInt(hour % 24)
  }
  //是否需要补零
  if (repair) {
    hour = hour < 10 ? "0" + hour : hour
    minute = minute < 10 ? "0" + minute : minute
    second = second < 10 ? "0" + second : second
  }
  return {
    day,
    hour,
    minute,
    second
  }
}