/** Apply the same keyboard-friendly format to every player's race text. */
export function normalizeRaceText(text: string): string {
  return text
    .normalize('NFC')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}
const CONTENT = [
  'sabah güneşi pencereden içeri girerken küçük kedi yavaşça uyandı mutfaktan gelen ekmek kokusunu takip etti masanın altında kendine bir yer buldu dışarıda yeni bir gün başlarken evin içinde huzurlu bir sessizlik vardı',
  'orman yolunda yürürken kuşların sesini dinledik ağaçların arasından ince bir dere akıyordu suyun yanında kısa bir mola verdik çantamızdaki elmayı paylaştık ve dönüş yolunda daha önce görmediğimiz bir patika keşfettik',
  'deniz kıyısındaki küçük kasabada günler sakin geçerdi balıkçılar sabah erkenden teknelerine binerdi sahilde yürüyen insanlar birbirine selam verirdi akşam olduğunda gökyüzünün rengi değişir ve bütün sokaklar serinlerdi',
  'yağmur başladığında herkes bir yere sığınmak için koştu biz köşedeki küçük kitapçıya girdik rafların arasında dolaşırken eski bir gezi kitabı bulduk yağmur dinene kadar hayalimizde uzak şehirleri ziyaret ettik',
  'bahçeye ektiğimiz tohumlar haftalar sonra yeşermeye başladı her sabah biraz su verdik ve yaprakların büyümesini izledik ilk çiçek açtığında hepimiz çok sevindik küçük bir emek zamanla bahçenin bütün havasını değiştirdi',
  'dağın tepesine ulaşmak düşündüğümüzden uzun sürdü yol boyunca birkaç kez dinlendik ama yürümeyi bırakmadık zirvede gördüğümüz manzara bütün yorgunluğumuzu unutturdu aşağıdaki köyler küçük renkli noktalar gibi görünüyordu',
  'bisikletlerimizi alıp nehir boyunca uzanan yola çıktık köprünün altında biraz dinlendik sonra rüzgarı arkamıza alarak devam ettik eve döndüğümüzde çok yorulmuştuk ama yeni bir rota bulduğumuz için hepimiz mutluyduk',
  'akşam parkta arkadaşlarımızla buluştuk önce biraz yürüdük sonra boş bir bankta oturup sohbet ettik herkes o gün yaşadığı komik bir olayı anlattı zamanın nasıl geçtiğini anlamadık eve giderken bir sonraki buluşmayı planladık',
  'küçük bir çocuk kartondan bir uzay gemisi yaptı pencerelerini maviye boyadı ve içine oyuncaklarını yerleştirdi odasının ortasındaki bu gemiyle her akşam başka bir gezegene gitti hayal gücü ona kocaman bir evren açıyordu',
  'gece gökyüzüne baktığımızda birkaç parlak yıldız gördük şehir ışıklarından uzaklaşınca gökyüzü daha da güzel görünüyordu bir battaniyeye sarılıp sessizce oturduk bazen hiçbir şey yapmadan sadece bakmak insana iyi geliyordu',
  'yeni bir oyun yapmak için önce kağıda küçük bir taslak çizdik karakterleri seçtik ve kuralları yazdık ilk denemede her şey istediğimiz gibi olmadı ama birlikte çalışarak sorunları çözdük sonunda oynaması eğlenceli bir oyun ortaya çıktı',
  'bir robotun hareket etmesi için pek çok küçük parça birlikte çalışır sensörler çevreyi algılar motorlar kolları hareket ettirir yazılım ise bütün bu bilgileri bir araya getirir iyi bir tasarım bazen en basit çözümü bulmakla başlar',
  'bilgisayarın başına oturup yeni bir fikir üzerinde çalışmaya başladım önce küçük bir liste hazırladım sonra en kolay işi bitirdim her tamamlanan adım bana biraz daha cesaret verdi büyük bir proje böylece küçük parçalara ayrıldı',
  'fotoğraf çekmek için pahalı bir makineye her zaman gerek yoktur bazen güzel bir ışık ve doğru bir açı yeterlidir sokaktaki bir gölge ya da penceredeki bir yansıma dikkatli bakınca ilginç bir hikaye anlatabilir',
  'mutfakta birlikte yemek yapmak başlı başına bir eğlencedir biri sebzeleri doğrar biri sofrayı hazırlar tencereden yükselen koku bütün evi sarar yemek hazır olduğunda herkes masaya oturur ve günün yorgunluğu biraz hafifler',
  'fırından yeni çıkmış ekmeği masaya koyduk yanına peynir zeytin ve sıcak çay hazırladık pencereyi açınca içeri serin bir hava doldu uzun uzun kahvaltı yapmak için acelemiz yoktu bazen güzel bir gün böyle sade başlar',
  'pazarda rengarenk meyveler ve sebzeler vardı satıcılar tezgahlarını düzenliyor insanlar alışveriş yapıyordu çantamıza birkaç elma ve taze domates koyduk dönüş yolunda bir sokak müzisyenini dinlemek için kısa bir süre durduk',
  'eski tren istasyonunda yolculuğumuzu beklerken rayların uzağa uzandığını izledik yanımızdaki küçük çantada kitap ve birkaç atıştırmalık vardı tren geldiğinde pencere kenarına oturduk şehir yavaşça geride kalırken yeni yerler görmeye hazırdık',
  'otobüs penceresinden geçen tarlaları izliyordum uzakta küçük bir köy ve ağaçlarla çevrili bir yol vardı yanımdaki arkadaşım uyuyakalmıştı ben ise gideceğimiz yerde bizi hangi manzaraların beklediğini düşünüyordum',
  'yeni bir şehri tanımanın en güzel yollarından biri yürümektir ana caddeden ayrılıp küçük sokaklara girince farklı ayrıntılar görürsün eski bir kapı sıcak bir fırın ya da sessiz bir meydan bazen yolculuğun en güzel anısı olur',
  'mahalledeki basketbol sahasında akşam bir maç yaptık takımlar eşit olmasa da herkes oyundan keyif aldı arada su içip dinlendik sonra yeniden sahaya döndük önemli olan kazanmak kadar birlikte güzel vakit geçirmekti',
  'koşuya ilk başladığım gün çok kısa bir mesafe gidebildim ertesi hafta biraz daha uzun koştum her gün kendimi başkalarıyla karşılaştırmak yerine önceki halime baktım küçük ilerlemeler zamanla büyük bir değişime dönüştü',
  'yüzme öğrenirken önce suya alışmak gerekiyordu havuzun kenarında nefes çalıştık sonra yavaşça ilerledik birkaç denemeden sonra hareketler daha kolay gelmeye başladı yeni bir şey öğrenmek sabır ve tekrar istiyordu',
  'müzik odasında herkes kendi çalgısını hazırladı önce sesler birbirine karıştı sonra ortak bir ritim bulduk küçük hatalar olsa da çalmayı bırakmadık birlikte dinleyip birbirimize uyum sağladığımızda ortaya güzel bir melodi çıktı',
  'eski bir defterin boş sayfasına aklıma gelen her şeyi yazdım bazı cümleler yarım kaldı bazıları küçük bir hikayeye dönüştü yazdıkça düşüncelerim daha düzenli hale geldi bazen bir fikri anlamanın en iyi yolu onu kağıda dökmektir',
  'kütüphanede sessiz bir masa bulup kitabımı açtım dışarıda insanlar aceleyle yürüyordu içeride ise zaman daha yavaş akıyor gibiydi birkaç sayfa sonra kendimi başka bir dünyanın içinde buldum kitaplar uzaklara gitmeden yolculuk yapmayı sağlıyordu',
  'küçük bir atölyede tahta parçalarını bir araya getirdik önce ölçü aldık sonra dikkatlice kestik parçalar birleşince ortaya bir kuş evi çıktı onu bahçedeki ağaca astık birkaç gün sonra ilk ziyaretçisini görmek hepimizi sevindirdi',
  'köpeğimiz sabah yürüyüşüne çıkacağımızı anlayınca kapının yanında beklemeye başladı parkta her ağacı tek tek kokladı sonra sevdiği topun peşinden koştu eve döndüğümüzde su içip yatağına uzandı onun için güzel bir sabah olmuştu',
  'kar yağınca sokaktaki bütün sesler biraz hafifledi çocuklar bahçeye çıkıp küçük bir kardan adam yaptı biz de sıcak içecekler hazırladık pencerenin yanında oturup beyaz örtüyü izledik kışın böyle sakin günlerinin ayrı bir güzelliği vardı',
  'yaz akşamında balkona küçük bir masa kurduk saksıdaki çiçekleri suladık ve serin havayı bekledik uzaktan gelen müzik sesine kuşların sesi karışıyordu gün boyunca yetişmeye çalıştığımız bütün işler o an biraz uzak görünüyordu',
  'sonbaharda yapraklar yavaşça renk değiştirdi parkın yolları sarı ve kahverengi tonlara büründü yürürken ayaklarımızın altında hafif bir ses duyuluyordu mevsimlerin değişmesi aynı yere her seferinde yeniden bakmamızı sağlıyordu',
  'ilkbahar geldiğinde pencereleri açıp evi havalandırdık bahçedeki ağaçlarda küçük tomurcuklar belirmişti uzun bir yürüyüş için dışarı çıktık güneş yüzümüzü ısıtırken yeni bir mevsimin başladığını hissettik',
  'arkadaşımın doğum günü için küçük bir sürpriz hazırladık herkes kendi yaptığı bir şeyi getirdi masaya renkli kağıtlar ve bir pasta koyduk kapı açıldığında yüzündeki mutluluğu görünce bütün hazırlığa değdiğini anladık',
  'bir işi yetiştirmek için acele ettiğimde daha çok hata yaptığımı fark ettim önce durup ne yapacağımı düşündüm sonra adımları sırayla tamamladım düzenli ilerlemek bazen hızlı hareket etmekten daha fazla zaman kazandırır',
  'evin eski saatini tamir etmeye çalışırken küçük parçaların ne kadar önemli olduğunu gördüm bir dişli doğru yerde olmayınca bütün düzen duruyordu parçaları dikkatle yerleştirdikten sonra saat yeniden çalışmaya başladı',
  'günün sonunda masamı topladım yarın yapacağım işleri küçük bir kağıda yazdım sonra telefonumu bırakıp biraz dinlendim her şeyi aynı anda bitirmek zorunda olmadığımı hatırlamak bana iyi geldi yeni bir gün için enerji topluyordum',
];
export const TEXTS = CONTENT.map(normalizeRaceText);
