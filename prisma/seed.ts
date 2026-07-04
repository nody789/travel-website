// prisma/seed.ts — 測試資料種子檔
// 執行方式：npx prisma db seed
// 這個檔案用來快速填入開發用的假資料，不會影響正式環境

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 開始建立測試資料...')

  // ─── 清空舊資料（開發用，正式環境不要這樣做）───────────────
  await prisma.review.deleteMany()
  await prisma.favorite.deleteMany()
  await prisma.destination.deleteMany()
  await prisma.category.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()
  await prisma.banner.deleteMany()
  await prisma.event.deleteMany()

  // ─── 分類 ─────────────────────────────────────────────────
  console.log('📂 建立分類...')
  const categories = await Promise.all([
    prisma.category.create({ data: { name: '自然景觀', icon: '🌿', slug: 'nature' } }),
    prisma.category.create({ data: { name: '歷史古蹟', icon: '🏛️', slug: 'historic' } }),
    prisma.category.create({ data: { name: '海灘島嶼', icon: '🏖️', slug: 'beach' } }),
    prisma.category.create({ data: { name: '城市探索', icon: '🏙️', slug: 'city' } }),
    prisma.category.create({ data: { name: '美食之旅', icon: '🍜', slug: 'food' } }),
    prisma.category.create({ data: { name: '山岳健行', icon: '⛰️', slug: 'mountain' } }),
    prisma.category.create({ data: { name: '溫泉度假', icon: '♨️', slug: 'onsen' } }),
    prisma.category.create({ data: { name: '藝術文化', icon: '🎨', slug: 'art' } }),
  ])

  const [nature, historic, beach, city, food, mountain, onsen, art] = categories
  console.log(`✅ 建立 ${categories.length} 個分類`)

  // ─── 使用者 ────────────────────────────────────────────────
  console.log('👤 建立使用者...')
  const hashedPassword = await bcrypt.hash('password123', 12)

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@travel.com',
      name: '網站管理員',
      password: hashedPassword,
      role: 'ADMIN',
      image: 'https://avatars.githubusercontent.com/u/1?v=4',
    },
  })

  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@example.com',
        name: 'Alice 旅遊控',
        password: hashedPassword,
        role: 'USER',
        image: 'https://i.pravatar.cc/150?img=1',
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@example.com',
        name: 'Bob 背包客',
        password: hashedPassword,
        role: 'USER',
        image: 'https://i.pravatar.cc/150?img=3',
      },
    }),
    prisma.user.create({
      data: {
        email: 'carol@example.com',
        name: 'Carol 攝影師',
        password: hashedPassword,
        role: 'USER',
        image: 'https://i.pravatar.cc/150?img=5',
      },
    }),
    prisma.user.create({
      data: {
        email: 'david@example.com',
        name: 'David 美食家',
        password: hashedPassword,
        role: 'USER',
        image: 'https://i.pravatar.cc/150?img=7',
      },
    }),
    prisma.user.create({
      data: {
        email: 'emma@example.com',
        name: 'Emma 登山客',
        password: hashedPassword,
        role: 'USER',
        image: 'https://i.pravatar.cc/150?img=9',
      },
    }),
  ])

  console.log(`✅ 建立 1 個管理員 + ${users.length} 個一般使用者`)

  // ─── 目的地 ────────────────────────────────────────────────
  console.log('🗺️  建立目的地...')
  const destinations = await Promise.all([

    // 台灣
    prisma.destination.create({
      data: {
        name: '九份老街',
        slug: 'jiufen',
        description: '九份是台灣北部新北市的一個山城，以其獨特的山城景觀聞名於世。老街上的紅燈籠、茶樓和蜿蜒的石階，每當夜幕降臨、燈籠亮起，整座山城彷彿穿越回昔日繁華的採金時代。\n\n這裡的芋圓、魚丸湯是必吃的在地美食，邊吃邊俯瞰基隆山和陰陽海，是許多旅人最難忘的台灣記憶。宮崎駿的《神隱少女》也被認為部分靈感來自九份，讓這裡更添神秘色彩。',
        location: '台灣・新北市',
        coverImage: 'https://images.unsplash.com/photo-1470093851219-69951fcbb533?w=800',
        categoryId: historic.id,
        isPublished: true,
        rating: 4.7,
        reviewCount: 5,
      },
    }),
    prisma.destination.create({
      data: {
        name: '太魯閣國家公園',
        slug: 'taroko',
        description: '太魯閣國家公園是台灣最壯觀的自然景觀之一，以深邃的大理石峽谷著稱。立霧溪歷經數百萬年的切割，形成了長達19公里的峽谷地形，最窄處兩壁幾乎相觸。\n\n園區內的燕子口步道、九曲洞步道和白楊步道是熱門的健行路線。春天賞花、夏天避暑、秋天楓紅、冬天尋幽，四季各有不同的迷人風景。前往前請先查詢管制資訊，部分步道需要申請入山許可。',
        location: '台灣・花蓮縣',
        coverImage: 'https://images.unsplash.com/photo-15240130038-4bba75e00b43?w=800',
        categoryId: nature.id,
        isPublished: true,
        rating: 4.8,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '阿里山日出',
        slug: 'alishan',
        description: '阿里山是台灣最著名的山地觀光地區，以雲海、日出、晚霞、森林和高山鐵路「五奇」聞名。搭乘百年歷史的阿里山小火車，穿越熱帶、暖帶、溫帶三種不同的森林地帶，是難得的旅遊體驗。\n\n每年3至4月的阿里山花季，漫山遍野的吉野櫻盛開，吸引大批遊客前往。清晨登上祝山觀日台，等待那一刻金色陽光從雲海中升起，是許多人一生必看的自然奇景。',
        location: '台灣・嘉義縣',
        coverImage: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800',
        categoryId: mountain.id,
        isPublished: true,
        rating: 4.6,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '墾丁國家公園',
        slug: 'kenting',
        description: '墾丁位於台灣最南端的恆春半島，是台灣第一座國家公園。三面環海的地理位置造就了豐富的海洋生態，珊瑚礁、熱帶魚、海龜……在清澈的海水中俯拾皆是。\n\n夏天的墾丁是衝浪、浮潛、水上活動的天堂；每年3月的春浪音樂祭吸引全台樂迷聚集。龍磐公園的懸崖草原壯觀無比，貓鼻頭和鵝鑾鼻燈塔也是必訪的地標。',
        location: '台灣・屏東縣',
        coverImage: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        categoryId: beach.id,
        isPublished: true,
        rating: 4.4,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '台南古城漫遊',
        slug: 'tainan',
        description: '台南是台灣最古老的城市，也是最能感受台灣歷史文化底蘊的地方。400年歷史的赤崁樓、安平古堡、億載金城……每一塊石磚都承載著荷蘭、明鄭、清朝的歷史記憶。\n\n台南最讓人著迷的，除了歷史，還有美食。擔仔麵、蝦捲、牛肉湯、棺材板、豆花……台南人對吃有著無比的堅持。在廟埕前的老店享用一碗米糕，看著香火繚繞，感受老城市的生活節奏，是最道地的台南體驗。',
        location: '台灣・台南市',
        coverImage: 'https://images.unsplash.com/photo-1589308154325-3fd81e25b8b4?w=800',
        categoryId: food.id,
        isPublished: true,
        rating: 4.9,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '日月潭',
        slug: 'sun-moon-lake',
        description: '日月潭是台灣最大的天然湖泊，位於南投縣魚池鄉的中心位置，海拔748公尺，四周群山環繞，湖光山色美不勝收。湖的東半部形如日輪，西半部狀似月鉤，因此得名。\n\n環湖自行車道全長約35公里，沿途可欣賞向山遊客中心、文武廟、玄光寺等景點。乘坐遊湖船前往拉魯島，是日月潭最浪漫的旅遊方式之一。每年中秋前後舉行的萬人泳渡日月潭活動，是全球知名的盛事。',
        location: '台灣・南投縣',
        coverImage: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=800',
        categoryId: nature.id,
        isPublished: true,
        rating: 4.5,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '宜蘭礁溪溫泉',
        slug: 'jiaoxi-onsen',
        description: '礁溪是台灣少見的平地溫泉鄉，泉質屬碳酸氫鈉泉，俗稱「美人湯」，對皮膚有很好的保養效果。從台北搭乘火車只需40分鐘，交通便利使礁溪成為台北人週末泡湯的首選。\n\n礁溪老街提供各式溫泉飯店、民宿選擇，從奢華的五星級溫泉酒店到價格親民的湯屋都有。泡完溫泉後，別忘了品嚐宜蘭的特色美食：鴨賞、糕渣、卜肉……每一樣都是讓人念念不忘的在地滋味。',
        location: '台灣・宜蘭縣',
        coverImage: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800',
        categoryId: onsen.id,
        isPublished: true,
        rating: 4.3,
        reviewCount: 3,
      },
    }),

    // 日本
    prisma.destination.create({
      data: {
        name: '京都嵐山竹林',
        slug: 'kyoto-arashiyama',
        description: '嵐山是京都最具代表性的觀光區，以漫步在高聳竹林中的神秘體驗聞名全球。清晨的竹林小徑（竹林の道）在陽光穿透下光影交錯，是世界上最美的步道之一。\n\n附近的天龍寺是世界文化遺產，擁有美麗的池泉回遊式庭園；渡月橋橫跨桂川，是嵐山最具代表性的地標。秋天的楓紅讓整個嵐山燃燒起來，被稱為京都最美的賞楓聖地之一。推薦一早入場，人潮尚少時感受竹林的寧靜。',
        location: '日本・京都府',
        coverImage: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        categoryId: nature.id,
        isPublished: true,
        rating: 4.8,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '東京澀谷十字路口',
        slug: 'tokyo-shibuya',
        description: '澀谷十字路口（澀谷スクランブル交差点）是全球最繁忙的行人穿越道，每次綠燈同時有超過3000人從各方向穿越，壯觀的景象讓它成為東京最具代表性的地標之一。\n\n澀谷周邊是東京最潮流的購物娛樂區，109百貨、PARCO、各大品牌旗艦店林立。忠犬八公銅像是澀谷最知名的集合地點，感人的故事讓無數旅人駐足。夜晚登上澀谷SKY展望台俯瞰城市夜景，十字路口的燈海盡收眼底。',
        location: '日本・東京都',
        coverImage: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800',
        categoryId: city.id,
        isPublished: true,
        rating: 4.5,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '富士山',
        slug: 'mount-fuji',
        description: '富士山是日本最高峰，海拔3776公尺，被日本人視為神聖之山，也是世界文化遺產。每年7至9月的開山期間，數十萬登山客從四條登山路線挑戰頂峰。\n\n即使不攀頂，從河口湖、山中湖或忍野八海眺望富士山的倒影，也是令人屏息的美景。清晨的赤富士（朝霞映照下呈現的紅色富士山）和積雪覆蓋的冬日富士山，是攝影師最愛的拍攝主題。',
        location: '日本・靜岡縣／山梨縣',
        coverImage: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?w=800',
        categoryId: mountain.id,
        isPublished: true,
        rating: 4.9,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '大阪道頓堀',
        slug: 'osaka-dotonbori',
        description: '道頓堀是大阪最具代表性的娛樂飲食街，巨大的霓虹招牌和傳說中的「固力果跑步人」看板讓這裡成為世界上認知度最高的日本街道之一。\n\n道頓堀的美食文化就是大阪「天下廚房」精神的縮影：章魚燒、大阪燒、串炸、拉麵……每一家老店都有自己的獨門配方和數十年的歷史。夜晚的道頓堀燈火輝煌，倒映在運河上，是大阪最迷人的夜景。',
        location: '日本・大阪府',
        coverImage: 'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?w=800',
        categoryId: food.id,
        isPublished: true,
        rating: 4.7,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '北海道旭川雪祭',
        slug: 'hokkaido-snow-festival',
        description: '每年2月舉行的北海道雪祭（さっぽろ雪まつり）是亞洲規模最大的冬季節慶，超過200座精緻的雪雕和冰雕作品在大通公園展出，吸引全球超過200萬觀光客前往。\n\n北海道的冬季除了雪祭，還有粉雪滑雪（二世谷是世界級的滑雪勝地）、流冰觀賞（知床半島）等體驗。北海道的螃蟹、海膽、牛奶、起司是日本最頂級的食材，冬天的美食旅遊更是一大享受。',
        location: '日本・北海道',
        coverImage: 'https://images.unsplash.com/photo-1548606819-06bff5ef5f3b?w=800',
        categoryId: city.id,
        isPublished: true,
        rating: 4.6,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '箱根溫泉鄉',
        slug: 'hakone-onsen',
        description: '箱根是距離東京最近的知名溫泉鄉，搭乘羅曼斯卡特急列車只需1.5小時即可抵達。箱根有多種類型的溫泉：強羅的豪華溫泉旅館、湯本的親民湯屋、仙石原的芒草原……每個地區都有不同的魅力。\n\n箱根開放式戶外美術館（彫刻の森美術館）是世界知名的戶外雕塑藝術園地；箱根神社的鳥居矗立在蘆之湖畔，倒映著富士山的身影，是日本最上鏡的景點之一。',
        location: '日本・神奈川縣',
        coverImage: 'https://images.unsplash.com/photo-1533050487297-09b450131914?w=800',
        categoryId: onsen.id,
        isPublished: true,
        rating: 4.7,
        reviewCount: 3,
      },
    }),

    // 韓國
    prisma.destination.create({
      data: {
        name: '首爾明洞購物街',
        slug: 'seoul-myeongdong',
        description: '明洞是首爾最著名的購物和觀光區，密集的化妝品店、時裝品牌、街頭美食攤販讓這條街道24小時人潮不斷。韓妝品牌如雨後春筍般佔據了整條街，讓明洞成為全球美妝迷的朝聖地。\n\n街頭小吃是明洞另一大魅力：炒年糕、魚板、雞蛋糕、螃蟹腳……邊走邊吃是明洞最道地的體驗。附近的南山首爾塔是俯瞰首爾全景的最佳地點，情侶在欄杆上掛上愛情鎖已成為浪漫傳統。',
        location: '韓國・首爾',
        coverImage: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=800',
        categoryId: city.id,
        isPublished: true,
        rating: 4.4,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '濟州島漢拏山',
        slug: 'jeju-hallasan',
        description: '漢拏山是韓國最高峰，海拔1950公尺，位於濟州島中心，是聯合國教科文組織認定的世界自然遺產。從城板岳登山口到白鹿潭火山口的登頂路線，沿途可欣賞從亞熱帶到高山苔原的植被變化。\n\n濟州島除了漢拏山，還有神秘的熔岩隧道（萬丈窟）、壯闊的瀑布（天帝淵、正方瀑布）和海女文化。濟州黑豬烤肉、生魚片、橘子是島上最具代表性的美食，建議租車環島才能深度探索這座火山島。',
        location: '韓國・濟州島',
        coverImage: 'https://images.unsplash.com/photo-1578991624414-276ef23a534f?w=800',
        categoryId: mountain.id,
        isPublished: true,
        rating: 4.5,
        reviewCount: 3,
      },
    }),

    // 東南亞
    prisma.destination.create({
      data: {
        name: '巴里島烏布',
        slug: 'bali-ubud',
        description: '烏布是巴里島的文化和藝術之心，被茂密的熱帶雨林和層層疊疊的梯田所環繞。與海濱度假的巴里島截然不同，烏布提供的是一種安靜內省的旅行體驗。\n\n烏布有著世界上最豐富的藝術生態：木雕、銀雕、傳統繪畫、巴里舞蹈……每個村落都有自己擅長的工藝。烏布皇宮前廣場每天晚上上演傳統的克差火舞（Kecak Dance），是最震撼的文化體驗。周邊的稻田步道、特甘嫩瀑布、聖猴森林也是必訪景點。',
        location: '印尼・巴里島',
        coverImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800',
        categoryId: art.id,
        isPublished: true,
        rating: 4.8,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '清邁古城',
        slug: 'chiang-mai',
        description: '清邁是泰國北部最重要的城市，有著超過700年的歷史，舊城區保留著完整的護城河和古城牆。城內有超過300座寺廟，金頂的素帖寺（Wat Doi Suthep）俯瞰全城，是清邁最神聖的地標。\n\n清邁的夜間市集是購物天堂：週六的Wualai Road步行街、週日的Sunday Walking Street，手工藝品、服飾、美食應有盡有。清邁也是學習泰式按摩、冥想、烹飪課程的最佳地點，有許多物美價廉的課程選擇。附近的大象保護區讓旅人以符合道德的方式與大象互動。',
        location: '泰國・清邁府',
        coverImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        categoryId: historic.id,
        isPublished: true,
        rating: 4.7,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '馬爾地夫水上屋',
        slug: 'maldives-overwater',
        description: '馬爾地夫是由1200多個珊瑚島嶼組成的島國，平均海拔不超過1.5公尺，是世界上地勢最低的國家。清澈見底的印度洋、白沙灘、色彩繽紛的珊瑚礁……馬爾地夫代表著人類對天堂的終極想象。\n\n水上屋（Water Villa / Overwater Bungalow）是馬爾地夫最具代表性的住宿體驗：房間直接架設在珊瑚礁上，從私人甲板跳入清澈的潟湖，腳下的玻璃地板透出熱帶魚的身影。浮潛、深潛、和鯊魚一起游泳、日落巡遊，每一天都是一場難以忘懷的夢境。',
        location: '馬爾地夫',
        coverImage: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800',
        categoryId: beach.id,
        isPublished: true,
        rating: 4.9,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '越南下龍灣',
        slug: 'halong-bay',
        description: '下龍灣是越南最著名的自然奇觀，由1969座大小石灰岩島嶼組成，從海面突出的奇峰怪石在晨霧中若隱若現，宛如一幅潑墨山水畫。1994年被列入世界遺產。\n\n乘坐木質帆船（Junk Boat）巡遊下龍灣是最經典的旅遊方式，通常為2晚3天，途中可到神秘洞穴（驚訝洞）、浮村、皮划艇探索幽靜的水道。日落時分在甲板上喝著啤酒，看著漁船在石灰岩山間穿梭，是越南最動人的旅遊畫面之一。',
        location: '越南・廣寧省',
        coverImage: 'https://images.unsplash.com/photo-1528127269322-539801943592?w=800',
        categoryId: nature.id,
        isPublished: true,
        rating: 4.6,
        reviewCount: 3,
      },
    }),

    // 歐洲
    prisma.destination.create({
      data: {
        name: '巴黎艾菲爾鐵塔',
        slug: 'paris-eiffel',
        description: '艾菲爾鐵塔是法國最具代表性的地標，由居斯塔夫・艾菲爾設計，1889年為慶祝法國大革命100週年而建。這座324公尺高的鐵製建築最初飽受批評，如今卻成為世界上參觀人數最多的付費景點。\n\n登上鐵塔三層，巴黎的城市景觀盡收眼底：塞納河、聖母院、盧浮宮、蒙馬特……每一個方向都是一幅藝術品。夜晚的鐵塔每整點亮起閃爍的燈光秀，在塞納河畔的草地上席地而坐，看著鐵塔在星空下閃爍，是巴黎最浪漫的夜晚時光。',
        location: '法國・巴黎',
        coverImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800',
        categoryId: historic.id,
        isPublished: true,
        rating: 4.7,
        reviewCount: 4,
      },
    }),
    prisma.destination.create({
      data: {
        name: '義大利阿馬菲海岸',
        slug: 'amalfi-coast',
        description: '阿馬菲海岸是義大利南部最美麗的海岸線，懸崖峭壁上繪了五顏六色的漁村，地中海的湛藍海水在陽光下閃閃發光，被列為世界遺產。\n\n從波西塔諾到拉維洛，每個小鎮都有各自的魅力：波西塔諾的彩色房屋、阿馬菲的大教堂、拉維洛的花園別墅。沿著懸崖邊的山路駕車（或搭乘巴士）是最刺激的體驗。夏天在深藍色的海灣游泳，享用新鮮的海鮮和檸檬利口酒，是義大利最令人嚮往的夏日生活。',
        location: '義大利・坎帕尼亞',
        coverImage: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800',
        categoryId: beach.id,
        isPublished: true,
        rating: 4.8,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '冰島極光與冰川',
        slug: 'iceland-aurora',
        description: '冰島是地球上觀賞北極光（Northern Lights / Aurora Borealis）最佳的地點之一，每年9月至3月的極夜期間，在遠離城市光害的地方靜靜等待，那抹翠綠色的光帶從地平線升起並翻騰舞動的瞬間，是許多旅人一生中最震撼的視覺體驗。\n\n除了極光，冰島的自然奇觀數不勝數：黑沙灘（Reynisfjara）的六角玄武岩柱、斯科加瀑布（Skógafoss）的彩虹、藍冰洞（Blue Ice Cave）的幽靜蔚藍、間歇泉（Geysir）的定時噴發……沿著1號環島公路的Ring Road之旅是許多旅人心中的夢想清單。',
        location: '冰島・雷克雅維克',
        coverImage: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800',
        categoryId: nature.id,
        isPublished: true,
        rating: 4.9,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '西班牙巴塞隆納高第建築',
        slug: 'barcelona-gaudi',
        description: '巴塞隆納是Antoni Gaudí留給世界最珍貴的藝術遺產聚集地。聖家堂（Sagrada Família）從1882年開始建造，至今仍未完工，但已成為世界上最獨特的教堂建築；奎爾公園的馬賽克拼貼長椅俯瞰整座城市；米拉之家的波浪形外牆如同海浪凝固。\n\n除了高第建築，巴塞隆納的拉瓦爾區（El Raval）、哥德區（Barri Gòtic）展示著不同時代的城市面貌。拉博蓋里亞市場（La Boqueria）的新鮮食材、La Barceloneta海灘的地中海風情、酒吧（Tapas Bar）的熱鬧氛圍……巴塞隆納是一座讓人每個角落都想拍照的城市。',
        location: '西班牙・加泰隆尼亞',
        coverImage: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800',
        categoryId: art.id,
        isPublished: true,
        rating: 4.8,
        reviewCount: 3,
      },
    }),
    prisma.destination.create({
      data: {
        name: '希臘聖托里尼',
        slug: 'santorini',
        description: '聖托里尼是愛琴海最浪漫的島嶼，以白牆藍頂的基克拉澤斯式建築聞名全球。依山而建的伊亞（Oia）小鎮，在落日時分將天空染成橙紅色，被稱為「世界最美的日落」，每天傍晚都會吸引數百名旅客聚集在懸崖邊等待。\n\n聖托里尼的火山口（Caldera）形成了獨特的C形海灣，從懸崖上的無邊際泳池（Infinity Pool）俯瞰深藍色的愛琴海，是許多人的蜜月聖地。品嚐當地出產的阿西提可白葡萄酒（Assyrtiko）、烤番茄飯（Tomatokeftedes）和新鮮漁獲，感受希臘的慢活哲學。',
        location: '希臘・基克拉澤斯群島',
        coverImage: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800',
        categoryId: beach.id,
        isPublished: true,
        rating: 4.9,
        reviewCount: 3,
      },
    }),

    // 加入幾個草稿（未上架），測試後台功能
    prisma.destination.create({
      data: {
        name: '秘魯馬丘比丘',
        slug: 'machu-picchu',
        description: '馬丘比丘是印加帝國最神秘的遺址，隱藏在安地斯山脈的雲霧之中，直到1911年才被外界知曉。「失落的印加城市」至今仍是考古學的謎團，無人知曉這座精密城市的確切用途。\n\n從庫斯科搭乘火車到阿瓜斯卡連特斯，再轉搭巴士蜿蜒而上，當古城在晨霧中緩緩現形，那份震撼是任何文字都難以形容的。印加步道（Inca Trail）是全球最知名的健行路線之一，4天的徒步讓你真正感受印加帝國的壯闊。',
        location: '秘魯・庫斯科大區',
        coverImage: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800',
        categoryId: historic.id,
        isPublished: false, // 草稿
        rating: 0,
        reviewCount: 0,
      },
    }),
    prisma.destination.create({
      data: {
        name: '摩洛哥撒哈拉沙漠',
        slug: 'sahara-desert',
        description: '撒哈拉沙漠是世界最大的熱帶沙漠，從摩洛哥出發可以輕鬆抵達梅祖卡（Merzouga）的厄爾切比沙丘（Erg Chebbi）。騎著駱駝走入沙丘，在星空下的沙漠帳篷露宿一夜，是許多旅人最難忘的非洲體驗。\n\n日出時分，沙丘在金黃色陽光照射下呈現出無數層次的橙紅色，整個沙漠如同一幅流動的藝術品。撒哈拉的夜晚沒有光害，銀河清晰可見，流星雨頻繁，是全球最佳觀星地點之一。',
        location: '摩洛哥・德拉-塔菲拉萊特',
        coverImage: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800',
        categoryId: nature.id,
        isPublished: false, // 草稿
        rating: 0,
        reviewCount: 0,
      },
    }),
  ])

  console.log(`✅ 建立 ${destinations.length} 個目的地（${destinations.filter(d => d.isPublished).length} 個已上架，${destinations.filter(d => !d.isPublished).length} 個草稿）`)

  // 取得已上架的目的地
  const published = destinations.filter(d => d.isPublished)

  // ─── 評論 ─────────────────────────────────────────────────
  console.log('💬 建立評論...')
  const reviewTexts = [
    { rating: 5, comment: '完全超乎預期！風景美到讓人屏息，一定要親自來看才能感受那份震撼。導遊很專業，行程安排得非常完善，強烈推薦！' },
    { rating: 5, comment: '我去過很多地方，但這裡真的是最美的之一。清晨的光線特別迷人，記得早點去避開人潮。下次還會再來！' },
    { rating: 4, comment: '整體體驗很好，景色美麗，當地美食也很棒。唯一的缺點是旺季人有點多，建議平日前往。' },
    { rating: 4, comment: '值得一去！雖然需要走一段路，但到達後的景色讓人覺得一切都值得。記得帶夠水和防曬。' },
    { rating: 5, comment: '人生必去清單上又可以打勾了！真的太美了，每個角落都是一張明信片。拍了好幾百張照片都不夠。' },
    { rating: 3, comment: '景點本身不錯，但設施有待改善，廁所不夠多且不太乾淨。旺季人擠人有點影響體驗，建議淡季前往。' },
    { rating: 5, comment: '這次旅行的最大亮點！當地人非常友善，物價也很合理。美食讓我念念不忘，回國後一直在回味那個味道。' },
    { rating: 4, comment: '很有特色的目的地，文化體驗很豐富。住宿選擇多元，可以找到各種價位的選項。交通稍微不方便，建議租車。' },
    { rating: 5, comment: '無與倫比的自然奇觀！站在那裡的那一刻，我真的感受到大自然的偉大。這輩子一定要來一次！' },
    { rating: 4, comment: '很棒的旅遊體驗，尤其是夕陽時分的景色讓人印象深刻。建議提前預訂，旺季很難找到住宿。' },
  ]

  // 為每個目的地建立評論（不同使用者、不同評分）
  const allUsers = [adminUser, ...users]
  let reviewCount = 0

  for (const dest of published.slice(0, 20)) {
    // 每個目的地隨機分配 2-5 則評論（確保不重複使用者）
    const shuffledUsers = [...allUsers].sort(() => Math.random() - 0.5)
    const reviewCountForDest = dest.reviewCount  // 用 seed 設定的數量
    const selectedUsers = shuffledUsers.slice(0, reviewCountForDest)

    for (let i = 0; i < selectedUsers.length; i++) {
      const text = reviewTexts[reviewCount % reviewTexts.length]
      await prisma.review.create({
        data: {
          userId: selectedUsers[i].id,
          destinationId: dest.id,
          rating: text.rating,
          comment: text.comment,
          isApproved: true,
        },
      })
      reviewCount++
    }
  }

  // 加入幾則待審核的評論
  for (const dest of published.slice(0, 5)) {
    await prisma.review.create({
      data: {
        userId: users[0].id,
        destinationId: dest.id,
        rating: 5,
        comment: '剛去回來，超棒的！這則評論還在等待審核中。',
        isApproved: false,
      },
    }).catch(() => {}) // 如果 unique constraint 衝到就跳過
  }

  console.log(`✅ 建立 ${reviewCount} 則評論（含待審核）`)

  // ─── 收藏 ─────────────────────────────────────────────────
  console.log('❤️  建立收藏...')
  let favoriteCount = 0

  for (const user of users) {
    // 每個使用者收藏 4-8 個隨機目的地
    const shuffled = [...published].sort(() => Math.random() - 0.5)
    const count = 4 + Math.floor(Math.random() * 5)
    const selected = shuffled.slice(0, count)

    for (const dest of selected) {
      await prisma.favorite.create({
        data: {
          userId: user.id,
          destinationId: dest.id,
        },
      }).catch(() => {})
      favoriteCount++
    }
  }

  console.log(`✅ 建立 ${favoriteCount} 筆收藏`)

  // ─── Banner ────────────────────────────────────────────────
  console.log('🖼️  建立 Banner...')
  await Promise.all([
    prisma.banner.create({
      data: {
        title: '探索亞洲最美目的地',
        subtitle: '從日本富士山到巴里島烏布，超過 20 個精選景點等你發現',
        image: 'https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1200',
        link: '/destinations',
        order: 0,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: '夏日海島特輯',
        subtitle: '沙灘、陽光、海浪，打造屬於你的完美夏日回憶',
        image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=1200',
        link: '/destinations?category=beach',
        order: 1,
        isActive: true,
      },
    }),
    prisma.banner.create({
      data: {
        title: '山岳健行・挑戰自我',
        subtitle: '富士山、玉山、漢拏山，征服亞洲三大名山',
        image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
        link: '/destinations?category=mountain',
        order: 2,
        isActive: true,
      },
    }),
  ])
  console.log('✅ 建立 3 個 Banner')

  // ─── 活動/事件 ─────────────────────────────────────────────
  console.log('📅 建立活動...')
  const now = new Date()
  await Promise.all([
    prisma.event.create({
      data: {
        title: '2026 亞洲旅遊博覽會',
        description: '年度最大旅遊盛會！匯聚超過 200 家旅行社和景點業者，現場提供最優惠的旅遊套裝行程，還有精彩表演和體驗活動等你參加。無論你是計畫蜜月、家庭旅遊或背包客行程，都能在這裡找到最適合的選擇。',
        image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 5),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        location: '台北世界貿易中心',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '京都賞楓特別企劃',
        description: '每年11月，京都的楓葉將整座城市染成金紅色，是日本最美的季節之一。我們精心規劃了5天4夜的賞楓行程，包含嵐山竹林、金閣寺、清水寺等必訪景點，以及正宗京料理體驗。名額有限，早鳥報名享85折優惠！',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        startDate: new Date(now.getFullYear(), 10, 15), // 11月
        endDate: new Date(now.getFullYear(), 10, 19),
        location: '日本・京都',
        isActive: true,
      },
    }),
    prisma.event.create({
      data: {
        title: '台灣美食旅遊節',
        description: '走遍台灣，品嚐在地美食！從台北的牛肉麵到台南的棺材板，從基隆的廟口夜市到彰化的肉圓，用味蕾探索台灣的飲食文化。活動期間舉辦多場美食達人講座、料理示範和夜市導覽。',
        image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 14),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21),
        location: '全台各縣市',
        isActive: true,
      },
    }),
    // 已結束的活動（測試用）
    prisma.event.create({
      data: {
        title: '2025 東南亞文化節',
        description: '體驗泰國潑水節、峇里島藝術節、越南傳統服飾，感受多元的東南亞文化魅力。',
        image: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=800',
        startDate: new Date(2025, 3, 10),
        endDate: new Date(2025, 3, 13),
        location: '台北華山文創園區',
        isActive: true,
      },
    }),
  ])
  console.log('✅ 建立 4 個活動')

  // ─── 摘要 ─────────────────────────────────────────────────
  console.log('\n🎉 測試資料建立完成！')
  console.log('──────────────────────────────')
  console.log('📧 管理員帳號：admin@travel.com')
  console.log('📧 一般帳號：alice@example.com')
  console.log('🔑 所有帳號密碼：password123')
  console.log('──────────────────────────────')
}

main()
  .catch((e) => {
    console.error('❌ Seed 失敗：', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
