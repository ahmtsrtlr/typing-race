# Typing Race

React + TypeScript + Vite + Tailwind CSS ön yüzü ve Node.js + Socket.IO sunucusuyla çalışan çok oyunculu yazı yarışı MVP'si. Çizgi film tarzındaki SVG koşucular, yazma ilerlemesine göre yatay kulvarlarda ilerler. Her hata 2 ceza puanı getirir; koşucu geri gitmez.

## Hızlı başlat

Node.js **22.12 veya üzeri** gerekir. ZIP'i aç, `typing-race` klasöründe terminal aç:

```bash
npm ci
npm run dev
```

Tarayıcıda **http://localhost:5173** adresini aç. Vite ve oyun sunucusu tek komutla birlikte başlar. Geliştirmede Vite, `/socket.io` isteklerini 3001 portundaki Node sunucusuna yönlendirir.

### İki oyuncuyla dene

1. İlk sekmede adını ve rengini seç, oda oluştur.
2. İkinci sekmede farklı bir ad yaz; **Odaya katıl** bölümüne ilk sekmenin oda kodunu gir.
3. İki sekmede de **Hazırım** düğmesine bas.
4. Oda sahibi **Yarışı başlat** düğmesine bassın.
5. Üç saniyelik geri sayımdan sonra metni yaz. Sekmelerde koşucular ve sıralama eşzamanlı güncellenir.
6. Bir hata yapıp yazmaya devam et. Sonraki doğru karakterler puan kazandırır; her yanlış karakter 2 puan ceza getirir. Geri silmek isteğe bağlıdır ve koşucuyu geri götürmez.
7. Metinler tamamlandığında ya da süre dolduğunda sonuçları gör. Oda sahibi **Bir tur daha** ile lobiye dönebilir.

Ana sayfadaki pist açıkça işaretlenmiş **örnek görünüm**dür. Simüle edilmiş rakip veya sahte çevrim içi oyuncu yoktur. **Antrenman yap**, aynı gerçek sunucuda tek oyunculu bir oda açar; lobide hazır olup yarışı başlat.

Aynı ağdaki başka bilgisayar/telefon: `npm run dev` çıktısındaki Network adresini aç (`http://BILGISAYAR_IP:5173`). Güvenlik duvarında 5173 portuna izin ver. Vite proxy kullanıldığından cihazlar için ayrı backend adresi ayarlaman gerekmez.

## Kontroller

```bash
npm run build     # TypeScript kontrolü + üretim derlemesi
npm test          # Hesaplama, Socket.IO çok oyunculu akışları ve HTTP testleri
```

HTTP testi `dist` içindeki üretim çıktısını kontrol eder; ilk test çalıştırmasından önce `npm run build` gerekir. Çok oyunculu testler gerçek Socket.IO sunucusunu ve istemcilerini geçici portlarda çalıştırır.

## Üretim sürümünü yerelde çalıştır

```bash
npm run build
npm start
```

**http://localhost:3001** adresini aç. Node sunucusu hem `dist` klasörünü hem Socket.IO bağlantısını sunar. Ayrı Vite sunucusu gerekmez. ZIP içindeki `dist` klasörü hazır bir derlemedir; kaynakta değişiklik yaptıysan yeniden derle.

`.env.example` dosyasını `.env` olarak kopyalayabilirsin. `PORT` varsayılan olarak 3001'dir. `CLIENT_ORIGIN`, ayrı bir ön yüz barındırırken izin verilen adresleri virgülle ayırır. Vite proxy dışında kullanmak için `VITE_SOCKET_URL` ayarla ve ön yüzü yeniden derle. Oda kodları yalnızca aynı sunucu örneğinde geçerlidir.

**Bu paket canlı bir URL'ye dağıtılmış değildir.** Gerçek çok oyunculu yayın için uzun süre çalışan Node.js sürecini ve WebSocket yükseltmesini destekleyen bir sunucu gerekir. `dist` klasörünü tek başına statik barındırmaya yüklemek oyun sunucusunu çalıştırmaz.

## Oyun kuralları ve hesaplama

- Odada en fazla **6** oyuncu bulunabilir. Tek kişilik antrenman da desteklenir.
- Süre seçenekleri **60 / 90 / 120 saniye**; seçimi oda sahibi oluştururken yapar.
- Metinler Türkçedir. Büyük/küçük harf, boşluk ve noktalama aynen yazılmalıdır.
- Mesafe: metinde ulaşılan en ileri karakter konumu. Yanlış karakter de yazma imlecini ilerletir; koşucu hatada veya geri silmede geri gitmez. Metnin sonuna gelmek, hatalar olsa da bitiş sayılır.
- **İlerleme** = `max(önceki ilerleme, floor(yazılmış karakter / metin uzunluğu × 100))`.
- **WPM** = `round((doğru karakter / 5) / geçen dakika)`. Tamamlayan oyuncunun WPM değeri bitiş anında sabitlenir.
- **Doğruluk** = `round((yazma denemesi − yanlış karakter) / yazma denemesi × 100)`. Silme deneme sayılmaz; silinen hatalar kayıtta kalır. Henüz yazılmamışsa %100 görünür.
- **Ceza** = `yanlış yazma denemesi × 2`. **Net puan** = `mevcut metindeki doğru karakter − ceza`. Puan negatif olabilir. Hata sonrasındaki doğru karakterler bağımsız sayılır; önceki hata puan kazandırmayı engellemez. Silme ceza iadesi yapmaz, aynı karakteri tekrar yazmak puanı çoğaltmaz.
- Sıralama önce net puana göre yapılır. Eşit puanda tamamlayanlar, ardından bitiş zamanı; tamamlamayan eşit puanlılarda doğru karakter, doğruluk ve WPM belirleyicidir.
- İstemci yüzde veya WPM göndermez; yalnızca metindeki tek karakterlik ekleme/silme değişimini gönderir. Sunucu değişimi doğrular ve tüm metrikleri kendisi hesaplar.
- Yapıştırma, metin ortasını değiştirme ve birden fazla karakteri topluca ekleme reddedilir. Klavye/IME girdisi tek karakterlik değişim üretmelidir; sesle yazma desteklenmez.
- Hafif CSS adım animasyonu WPM ile hızlanır. `prefers-reduced-motion` tercihi animasyonları kapatır.

## Kaynak yapısı

```text
src/
  App.tsx                    Uygulama çerçevesi ve ekran seçimi
  pages/                     HomePage, LobbyPage ve RacePage
  hooks/useGame.ts           Socket bağlantısı, istek ve hata yönetimi
  components/
    RunnerCharacter.tsx      SVG karakter ve adım animasyonu
    RaceTrack.tsx            Pist, TrackLane ve sahne
    TypingPanel.tsx          Karakter doğrulama ve yazma alanı
    RaceSidebar.tsx          Metrikler ve canlı sıralama
    Results.tsx              Sonuçlar ve rövanş
  styles.css                 Tailwind + responsive tasarım ve CSS animasyonları
shared/
  types.ts                   İki tarafın ortak tipleri ve olay sözleşmeleri
  race.ts                    Hesaplama, sıralama ve giriş doğrulama
server/
  game.ts                    Oda yaşam döngüsü ve sunucu otoriteli yarış
  http.ts                    Statik dosya sunumu ve health endpoint
  index.ts                   HTTP + Socket.IO başlangıcı
tests/                       Birim ve gerçek istemcili entegrasyon testleri
```

## MVP sınırları

Odalar bellekte tutulur; sunucu yeniden başlarsa kaybolur. Tek Node.js örneği desteklenir. Hesaplar, kalıcı istatistikler, Redis adaptörü, izleyici modu ve rekabetçi anti-cheat yoktur. Sunucuya güvenilmeyen istemcilerin otomatik yazmasını tamamen önleyen bir sistem değildir; temel giriş doğrulama ve hız sınırı vardır.

Bağlantısı kesilen oyuncu yarış sırasında sonuçlarda tutulur, yarışa otomatik devam etmez. Yeniden bağlandıktan sonra lobideki bir odaya tekrar katılabilir; devam eden yarışa katılım kapalıdır. Lobi oda sahibi ayrılırsa sahiplik sıradaki oyuncuya aktarılır. Geri sayımda biri ayrılırsa oda lobiye döner. Herkes ayrıldığında oda ve zamanlayıcı temizlenir.

Bu ortamda tarayıcı otomasyonu mevcut olmadığından görsel/tıklamalı tarayıcı kontrolü yapılmadı. TypeScript, üretim derlemesi, gerçek istemcili Socket.IO senaryoları ve üretim HTTP yanıtları test edildi. Tarayıcıdan manuel iki sekmeli test yukarıdaki adımlarla yapılabilir.

Teknik başvuru: [Socket.IO TypeScript](https://socket.io/docs/v4/typescript), [Tailwind Vite kurulumu](https://tailwindcss.com/docs/installation/using-vite).

## Mobil görünüm (v0.2)

320–760 px telefon ekranlarında tek sütun, büyük dokunma hedefleri ve 16 px giriş yazıları kullanılır. Yarıştaki kulvarlar daha kısadır; sonuç tablosu oyuncu kartlarına dönüşür. **Klavyeyi aç** düğmesi telefon klavyesini doğrudan kullanıcı dokunuşuyla açar. VisualViewport klavye açıldığını bildirirse kendi kulvarın ve yazma panelin öne çıkar, diğer kulvarlar ve yan panel geçici olarak gizlenir. Klavye kapanınca tam pist geri gelir. Otomatik düzeltme ve otomatik büyük harf kapalıdır.

Mobil manuel kontrol: 320/375/390/430 px genişliklerde ana sayfa, lobi, 6 kişilik pist ve sonuçları aç; telefonda klavyeyi açıp yazma panelinin erişilebilir kaldığını kontrol et. Gerçek cihaz/tarayıcı görsel kontrolü bu ortamda yapılamadı.
