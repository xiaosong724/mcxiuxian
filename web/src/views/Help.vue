<template>
  <div class="container">
    <h1 class="page-title">🧘 修仙玩法与指令介绍</h1>

    <div class="tip-banner pixel-panel">
      🧪 还没账号？可用体验账号 <code>test / 123456</code> 浏览（只读）。
      正式使用请在游戏内 <code>/ctm reg</code> 注册。
    </div>

    <div class="card pixel-panel">
      <h3 class="sec-title">💡 修仙物品说明</h3>
      <p class="muted">
        修仙物品（妖丹、丹药、药材、储物袋）使用<b>游戏内的普通道具替代</b>显示：<br/>
        🔮 妖丹 = 粘液球 · 🧪 丹药 = 苹果 · 🌿 药材 = 农作物/花朵 · 🎒 储物袋 = 荧光墨囊<br/>
        这些道具带有专属修仙标记，功能判定不受物品改名影响。<b>完全不影响这些道具在游戏中的正常使用</b>（粘液球、苹果等原版功能照常）。
      </p>
    </div>

    <!-- 快速上手 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">📌 新手快速上手</h3>
      <p class="muted">
        1. 打开菜单 <code>/xiuxian</code> 查看状态与功能<br/>
        2. 挖矿获取灵石，用 <code>/xx absorb &lt;数量&gt;</code> 吸收修为<br/>
        3. 修为足够后 <code>/xx up</code> 尝试突破境界<br/>
        4. 击杀生物掉落妖丹，可出售或服用<br/>
        5. 采集药材炼制丹药，晋升炼丹师<br/>
        6. 用 <code>/ctm</code> 交易系统买卖修仙物品
      </p>
    </div>

    <!-- 灵根 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🧬 灵根系统</h3>
      <p>首次加入随机分配灵根，决定修炼速度与突破成功率：</p>
      <table class="list">
        <thead><tr><th>灵根</th><th>概率</th><th>修炼速度</th><th>突破概率</th></tr></thead>
        <tbody>
          <tr><td>⭐ 单灵根</td><td>10%</td><td>最快（省 10% 灵石）</td><td>高 11%</td></tr>
          <tr><td>双灵根</td><td>20%</td><td>较快（省 5% 灵石）</td><td>高 5%</td></tr>
          <tr><td>三灵根</td><td>50%</td><td>正常</td><td>正常</td></tr>
          <tr><td>伪灵根</td><td>20%</td><td>较慢（多耗 5% 灵石）</td><td>低 5%</td></tr>
        </tbody>
      </table>
      <p class="muted">
        <b>五行属性</b>：金、木、水、火、土。服用对应属性妖丹累积属性值。<br/>
        到达元婴突破大境界（元婴→化神）起，需要满足对应五行属性需求：<br/>
        属性需求 = 该境界总需求 ÷ 灵根数，<b>每个灵根属性都要达标</b>。<br/>
        例：火土<b>双灵根</b>突破元婴→化神 → 火属性 6,000 + 土属性 6,000；<b>单火灵根</b> → 火属性 12,000。<br/>
        <b>洗髓丹</b>可重置灵根（品质越高，洗出好灵根概率越大）。
      </p>
    </div>

    <!-- 境界 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">📈 境界与突破</h3>
      <p>共 12 大境界：凡人境 → 炼体 → 练气 → 筑基 → 金丹 → 元婴 → 化神 → 炼虚 → 合体 → 大乘 → 渡劫 → <b>飞升</b>。</p>
      <p class="muted">
        突破小层成功率 <b>90%</b>，大境界 <b>70%</b>（渡劫期 50%）。<br/>
        失败会损失修为（突破消耗 + 失败反噬：小层 20%、大境界 30%、渡劫期 40%）；<br/>
        <b>只要当前修为足够支付损失，就不会跌落境界</b>；只有修为不足抵扣时才会跌落（层数-1，最低则大境界-1）。<br/>
        生命/攻击/防御随境界自动提升（从凡人境 20❤ 到飞升 500❤）。<br/>
        <code>破障丹</code> 突破成功率 <b>+15%</b>。
      </p>
      <p class="muted"><b>部分突破所需修为参考</b>：凡人→炼体 100，炼体→练气 250，练气→筑基 600，筑基→金丹 1,500，金丹→元婴 4,000，元婴→化神 10,000，渡劫→飞升 800,000。</p>
    </div>

    <!-- 灵石与灵气 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">💎 灵石与灵气</h3>
      <p><b>灵石获取</b>（挖矿）：</p>
      <table class="list">
        <thead><tr><th>矿物</th><th>灵石</th><th>矿物</th><th>灵石</th></tr></thead>
        <tbody>
          <tr><td>煤矿</td><td>2~3</td><td>金矿/下界金矿</td><td>10~16</td></tr>
          <tr><td>铜矿</td><td>3~5</td><td>钻石矿</td><td>70~90</td></tr>
          <tr><td>铁矿</td><td>6~8</td><td>绿宝石矿</td><td>100~140</td></tr>
          <tr><td>红石/青金石</td><td>15~25</td><td>远古残骸</td><td>350</td></tr>
        </tbody>
      </table>
      <p class="muted">挖任意方块有 0.3% 概率额外获得 1~3 灵石；出售妖丹也可获得灵石。</p>
      <p><b>灵气</b>（战斗与飞行能量）：</p>
      <p class="muted">
        近战（有武器）-2、远程 -3、空手 -1；灵气耗尽攻击失效并获得<b>虚弱效果</b>。<br/>
        恢复：灵石 1:10（<code>/xx restore &lt;数量&gt;</code>）、服用回灵丹（一品 50 → 九品 750 灵气）；<br/>
        <b>突破境界成功还会回满灵气，并提升灵气上限 +10</b>。
      </p>
    </div>

    <!-- 妖丹 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🔮 妖丹系统</h3>
      <p>击杀生物掉落<b>随机五行属性</b>的妖丹（属性值 10/20/30/50/80/200），共 80 种生物可获得：</p>
      <table class="list">
        <thead><tr><th>生物</th><th>灵石</th><th>生物</th><th>灵石</th></tr></thead>
        <tbody>
          <tr><td>鸡/蝙蝠</td><td>3~4</td><td>苦力怕</td><td>40</td></tr>
          <tr><td>牛/猪/羊</td><td>6~8</td><td>末影人</td><td>80</td></tr>
          <tr><td>僵尸/骷髅/蜘蛛</td><td>15~18</td><td>凋零骷髅</td><td>150</td></tr>
          <tr><td>铁傀儡</td><td>50</td><td>远古守卫者</td><td>800</td></tr>
          <tr><td>监守者</td><td>1,500</td><td>凋灵</td><td>5,000</td></tr>
          <tr><td>🐉 末影龙</td><td>20,000</td><td></td><td></td></tr>
        </tbody>
      </table>
      <button class="pixel-btn" style="margin-top:10px;" @click="showAllMobs = !showAllMobs">
        {{ showAllMobs ? '收起全部生物 ▲' : '查看全部生物 ▼' }}
      </button>
      <div v-if="showAllMobs" class="mob-all">
        <table class="list">
          <thead><tr><th>生物</th><th>灵石</th><th>生物</th><th>灵石</th></tr></thead>
          <tbody>
            <tr v-for="(row, i) in mobRows" :key="i">
              <td>{{ row[0].name }}</td><td>{{ row[0].val }}</td>
              <td v-if="row[1]">{{ row[1].name }}</td><td v-if="row[1]">{{ row[1].val }}</td>
              <td v-if="!row[1]"></td><td v-if="!row[1]"></td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="muted">
        <code>/xx sell</code> 一键出售全部妖丹；<br/>
        菜单「服用妖丹」<b>自动匹配灵根</b>——只有金灵根就只吃金妖丹，其余保留。
      </p>
    </div>

    <!-- 炼丹 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🧪 炼丹系统</h3>
      <p><b>药材采集</b>：挖农作物（基础药材，品质 1-5）与花朵（稀有药料，品质 1-9），挖一个必须捡一个。</p>
      <p class="muted"><b>品质机制</b>：基础药材品质影响炼丹成功率，稀有药料品质影响丹药品质。</p>
      <p><b>六种丹药</b>（点击丹药名查看各品阶炼制概率与效果）：</p>
      <table class="list">
        <thead><tr><th>丹药</th><th>材料</th><th>效果</th></tr></thead>
        <tbody>
          <tr v-for="d in danList" :key="d.key">
            <td><a href="#" class="dan-link" @click.prevent="toggleDan(d.key)">{{ d.emoji }} {{ d.name }} {{ expanded === d.key ? '▲' : '▼' }}</a></td>
            <td>{{ d.materials }}</td>
            <td>{{ d.effect }}</td>
          </tr>
        </tbody>
      </table>

      <!-- 丹药品阶详情 -->
      <div v-if="expanded === 'xisui'" class="dan-detail">
        <h4 class="sec-sub">🌀 洗髓丹 · 各品阶炼制概率 / 服用成功率 / 灵根品质概率</h4>
        <p class="muted">炼制出 ≥该品阶的概率（受药材品质加成）；服用成功率即重置灵根的成功率；灵根概率为洗出对应灵根的比例。</p>
        <table class="list">
          <thead><tr><th>品阶</th><th>出现概率</th><th>服用成功率</th><th>单灵根</th><th>双灵根</th><th>三灵根</th><th>伪灵根</th></tr></thead>
          <tbody>
            <tr v-for="q in qualityList" :key="q.q">
              <td>{{ q.name }}</td>
              <td>{{ q.rate }}</td>
              <td>{{ xisuiRate[q.q] }}</td>
              <td>{{ xisuiRoot[q.q].single }}%</td>
              <td>{{ xisuiRoot[q.q].double }}%</td>
              <td>{{ xisuiRoot[q.q].triple }}%</td>
              <td>{{ xisuiRoot[q.q].false }}%</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="expanded && expanded !== 'pozhang'" class="dan-detail">
        <h4 class="sec-sub">{{ danInfo(expanded).emoji }} {{ danInfo(expanded).name }} · 各品阶炼制概率与效果</h4>
        <p class="muted">「出现概率」为炼制出 ≥该品阶的基础概率（受药材品质加成）；「效果」随品阶倍率提升。</p>
        <table class="list">
          <thead><tr><th>品阶</th><th>出现概率</th><th>效果</th></tr></thead>
          <tbody>
            <tr v-for="q in qualityList" :key="q.q">
              <td>{{ q.name }}</td>
              <td>{{ q.rate }}</td>
              <td>{{ danEffect(expanded, q.mult) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else-if="expanded === 'pozhang'" class="dan-detail">
        <h4 class="sec-sub">🔥 破障丹 · 说明</h4>
        <p class="muted">破障丹固定九品品质，无品阶差异：服用后下次突破成功率 <b>+15%</b>（一次性）。</p>
      </div>

      <button class="pixel-btn" style="margin-top:10px;" @click="showBonus = !showBonus">
        {{ showBonus ? '收起药材品质加成 ▲' : '查看药材品质加成 ▼' }}
      </button>
      <div v-if="showBonus" class="dan-detail">
        <h4 class="sec-sub">🌾 药材品质加成</h4>
        <p class="muted">
          <b>基础药材（农作物）</b>：品质 1 无加成，2~5 每级提升炼丹成功率 +2.5%，最高 +10%。<br/>
          <b>稀有药料（花）</b>：品质 1 无加成，2~9 每级提升丹药品质 +1.25%，最高 +10%。
        </p>
        <table class="list">
          <thead><tr><th>品质</th><th>基础药材（成功率加成）</th><th>稀有药料（品质加成）</th></tr></thead>
          <tbody>
            <tr v-for="b in bonusList" :key="b.q">
              <td>{{ b.q }} 品</td>
              <td>{{ b.crop }}</td>
              <td>{{ b.flower }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p class="muted">
        丹药<b>一品~九品</b>品质随机，品质越高效果越强；<b>六品以上全服广播</b>。<br/>
        <b>炼丹师称号</b>：同一品级累计炼制 10 颗晋升（一品→九品炼丹师）。<br/>
        游戏内炼丹菜单可查看各品阶成功次数、各丹药数量与失败次数。
      </p>
    </div>

    <!-- 储物袋 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🎒 储物袋</h3>
      <p class="muted">
        <b>获得</b>：击杀生物概率掉落 1~3 级储物袋。<br/>
        <b>使用</b>：打开 <code>/xiuxian</code> 菜单使用储物袋（扣除背包中的荧光墨囊），再次打开菜单即可使用空间。<br/>
        <b>强化</b>：菜单可强化——强化手持储物袋，或对已使用的储物袋继续强化；消耗 1 个 1~3 级储物袋，成功率 <b>50%</b>。<br/>
        <b>等级</b>：1~10 级，每级 +30 格，最高 <b>300 格</b>，可存放带 NBT 的修仙物品。
      </p>
    </div>

    <!-- 飞行 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🕊️ 飞行</h3>
      <p class="muted">
        <b>条件</b>：筑基及以上境界、灵气 > 50。<br/>
        聊天输入 <code>飞</code> 起飞、<code>落</code> 停止。飞行时长 15秒+(境界-3)×10秒，消耗 1 灵气/秒。<br/>
        无需鞘翅、无需烟花。
      </p>
    </div>

    <!-- 交易 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">🛒 天南交易所</h3>
      <p>游戏 + 网页一体交易平台：</p>
      <p class="muted">
        1. 游戏内 <code>/ctm reg &lt;账号&gt; &lt;密码&gt;</code> 注册账号（自动绑定玩家与服务器）<br/>
        2. 游戏内 <code>/ctm sell &lt;价格&gt;</code> 上架手持修仙物品（每名玩家限 10 件在售）<br/>
        3. 网页市场浏览/筛选商品 → 加入购物车 → 游戏内 <code>/ctm buy &lt;编号&gt;</code> 支付灵石<br/>
        4. 卖出所得 <code>/ctm income</code> 查看、<code>/ctm claim</code> 领取<br/>
        5. 网页可管理上架/下架、查看交易记录与排行榜
      </p>
      <p class="muted">
        <b>网页功能</b>：市场（分页/类型筛选/服务器筛选）、购物车、我的上架、交易记录（累计消耗/盈利）、排行榜（境界/灵石/炼丹师）、卖家信息（境界/灵根/成交单数）。
      </p>
    </div>

    <!-- 指令大全 -->
    <div class="card pixel-panel">
      <h3 class="sec-title">📋 指令大全</h3>
      <table class="list">
        <thead><tr><th>指令</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td><code>/xiuxian</code></td><td>修仙主菜单</td></tr>
          <tr><td><code>/xx status</code></td><td>查看修炼状态</td></tr>
          <tr><td><code>/xx sell</code></td><td>出售背包全部妖丹</td></tr>
          <tr><td><code>/xx absorb &lt;数量&gt;</code></td><td>消耗灵石吸收修为</td></tr>
          <tr><td><code>/xx restore &lt;数量&gt;</code></td><td>消耗灵石恢复灵气</td></tr>
          <tr><td><code>/xx up</code></td><td>尝试突破境界</td></tr>
          <tr><td><code>/cun</code></td><td>将手中物品存入储物袋</td></tr>
          <tr><td><code>/qh</code></td><td>强化手中储物袋</td></tr>
          <tr><td><code>飞 / 落</code></td><td>聊天输入，飞行开关</td></tr>
          <tr><td><code>/ctm cd</code></td><td>打开交易所菜单</td></tr>
          <tr><td><code>/ctm reg &lt;账号&gt; &lt;密码&gt;</code></td><td>注册交易账号（自动绑定）</td></tr>
          <tr><td><code>/ctm changepw &lt;新密码&gt;</code></td><td>修改密码</td></tr>
          <tr><td><code>/ctm sell [价格]</code></td><td>上架手持物品</td></tr>
          <tr><td><code>/ctm cart</code></td><td>查看购物车</td></tr>
          <tr><td><code>/ctm buy &lt;编号&gt;</code></td><td>支付购买购物车商品</td></tr>
          <tr><td><code>/ctm income</code></td><td>卖出记录</td></tr>
          <tr><td><code>/ctm claim</code></td><td>领取卖出灵石</td></tr>
          <tr><td><code>/ctm back [编号]</code></td><td>取回下架商品</td></tr>
          <tr><td><code>/xx help</code></td><td>游戏内查看 xx 帮助</td></tr>
          <tr><td><code>/ctm help</code></td><td>游戏内查看交易帮助</td></tr>
        </tbody>
      </table>
      <p class="muted" style="margin-top:8px;">
        管理员额外拥有 <code>/xgive &lt;类型&gt; &lt;玩家&gt; &lt;数量&gt;</code>（给予灵石/修为/五行）、<code>/ctm cross on|off</code>（跨服开关）、<code>/ctmgive</code>（获取测试物品）等指令。
      </p>
    </div>

    <!-- FAQ -->
    <div class="card pixel-panel">
      <h3 class="sec-title">❓ 常见问题</h3>
      <p class="muted">
        <b>灵石不够？</b> 挖矿 / 出售妖丹。<br/>
        <b>灵气耗尽攻击无效？</b> <code>/xx restore</code> 或服用回灵丹。<br/>
        <b>突破失败？</b> 修为达标 + 破障丹 + 好的灵根。<br/>
        <b>炼丹材料不足？</b> 挖取农作物与花朵采集药材（挖一个捡一个）。<br/>
        <b>网页登录不上？</b> 先用 <code>/ctm reg</code> 在游戏内注册。<br/>
        <b>上架失败？</b> 每名玩家限 10 件在售，先下架部分商品。<br/>
        <b>购物车商品失效？</b> 可能库存售罄或跨服交易关闭。<br/>
        <b>背包满了？</b> 建议平时保持背包留有空余位置——购买/取回物品时需要空间，背包满会操作失败。
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import mobs from './_mob_data.json'

const showAllMobs = ref(false)
// 完整生物表：每行两个生物（两列布局）
const mobRows = computed(() => {
  const rows = []
  for (let i = 0; i < mobs.length; i += 2) rows.push([mobs[i], mobs[i + 1]])
  return rows
})

// ===== 炼丹数据（与游戏端 DAN_RECIPES/DAN_QUALITY_RATE/XISUI_RATE/randomRootByQuality 一致） =====
const expanded = ref('')
const showBonus = ref(false)
function toggleDan(key) {
  expanded.value = expanded.value === key ? '' : key
}
const danInfo = (key) => danList.find(d => d.key === key) || {}
const danList = [
  { key: 'huiling', emoji: '🟢', name: '回灵丹', materials: '小麦×3 + 蒲公英×1', effect: '恢复灵气' },
  { key: 'peiyuan', emoji: '🟡', name: '培元丹', materials: '胡萝卜×3 + 罂粟×1', effect: '增加修为' },
  { key: 'wuxing', emoji: '🟠', name: '五行丹', materials: '马铃薯×3 + 兰花×1', effect: '随机灵根属性' },
  { key: 'xuming', emoji: '❤️', name: '续命丹', materials: '甜菜根×3 + 绒球葱×1', effect: '恢复生命' },
  { key: 'pozhang', emoji: '🔥', name: '破障丹', materials: '小麦×5 + 矢车菊×2', effect: '突破成功率+15%（固定九品）' },
  { key: 'xisui', emoji: '🌀', name: '洗髓丹', materials: '胡萝卜×5 + 铃兰×2 + 钻石×1', effect: '重置灵根' },
]
// 各品阶出现概率（roll<rate 触发，即 ≥该品阶的累计基础概率）与效果倍率
const qualityList = [
  { q: 9, name: '九品', rate: '0.2%', mult: 15 },
  { q: 8, name: '八品', rate: '0.8%', mult: 10 },
  { q: 7, name: '七品', rate: '2%', mult: 7 },
  { q: 6, name: '六品', rate: '5%', mult: 5 },
  { q: 5, name: '五品', rate: '18%', mult: 2.5 },
  { q: 4, name: '四品', rate: '30%', mult: 2 },
  { q: 3, name: '三品', rate: '45%', mult: 1.6 },
  { q: 2, name: '二品', rate: '60%', mult: 1.3 },
  { q: 1, name: '一品', rate: '80%', mult: 1 },
]
// 各丹药每阶效果（mult 倍率，与游戏端一致）
function danEffect(key, mult) {
  if (key === 'huiling') return '恢复 ' + Math.floor(50 * mult) + ' 灵气'
  if (key === 'peiyuan') return '增加 ' + Math.floor(100 * mult) + ' 修为'
  if (key === 'wuxing') return '增加 ' + Math.floor(100 * mult) + ' 五行属性'
  if (key === 'xuming') return '恢复 ' + (4 * mult) + ' 颗心生命'
  return '-'
}
// 洗髓丹：各品阶服用成功率
const xisuiRate = { 1: '10%', 2: '20%', 3: '30%', 4: '40%', 5: '50%', 6: '60%', 7: '70%', 8: '80%', 9: '95%' }
// 洗髓丹：各品阶洗出灵根品质概率（%）
const xisuiRoot = {
  1: { single: 5, double: 15, triple: 40, false: 40 },
  2: { single: 8, double: 19, triple: 43, false: 30 },
  3: { single: 10, double: 22, triple: 43, false: 25 },
  4: { single: 12, double: 24, triple: 44, false: 20 },
  5: { single: 15, double: 26, triple: 44, false: 15 },
  6: { single: 18, double: 28, triple: 42, false: 12 },
  7: { single: 22, double: 30, triple: 40, false: 8 },
  8: { single: 45, double: 35, triple: 19, false: 1 },
  9: { single: 55, double: 32, triple: 12, false: 1 },
}
// 药材品质加成：农作物每级 +2.5%（成功率，1-5品），花每级 +1.25%（品质，1-9品），最高 +10%
const bonusList = [
  { q: 1, crop: '无加成', flower: '无加成' },
  { q: 2, crop: '+2.5%', flower: '+1.25%' },
  { q: 3, crop: '+5%', flower: '+2.5%' },
  { q: 4, crop: '+7.5%', flower: '+3.75%' },
  { q: 5, crop: '+10%', flower: '+5%' },
  { q: 6, crop: '—（药材最高5品）', flower: '+6.25%' },
  { q: 7, crop: '—', flower: '+7.5%' },
  { q: 8, crop: '—', flower: '+8.75%' },
  { q: 9, crop: '—', flower: '+10%' },
]
</script>

<style scoped>
.sec-title { color: var(--gold); margin-bottom: 10px; }
.card p { margin-bottom: 6px; line-height: 1.7; }
.card code { color: var(--gold); background: rgba(0,0,0,.3); padding: 1px 5px; border-radius: 3px; }
.mob-all { margin-top: 10px; max-height: 340px; overflow-y: auto; border: 1px solid var(--border); border-radius: 4px; }
.dan-link { color: var(--accent2); cursor: pointer; text-decoration: none; }
.dan-link:hover { color: var(--gold); }
.dan-detail { margin-top: 12px; padding: 12px; border: 1px solid var(--border); border-radius: 4px; background: var(--bg-panel2); }
.sec-sub { color: var(--gold); margin-bottom: 8px; }
</style>
