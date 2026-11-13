/* Locale dictionary: Hindi (India), Devanagari script.
   Translations are written to read naturally in Hindi, not word-by-word.
   Structure must match en-IN.ts exactly (enforced by the Dictionary type). */

import type { Dictionary } from './en-IN'

const hiIN: Dictionary = {
  app: {
    tagline: 'फोटो कंप्रेसर और इमेज रीसाइज़र',
    privacy:
      '100% ऑफ़लाइन — आपकी फ़ोटो इस डिवाइस से बाहर नहीं जातीं। कोई अपलोड नहीं, कोई अकाउंट नहीं, कोई विज्ञापन नहीं।',
    steps: {
      select: 'फ़ोटो चुनें',
      settings: 'सेटिंग्स',
      results: 'परिणाम',
    },
    progress: 'प्रगति',
    language: 'भाषा',
    switchToLight: 'लाइट मोड चालू करें',
    switchToDark: 'डार्क मोड चालू करें',
    footer: 'Fotmio by Dusrel — हर डिवाइस के लिए मुफ़्त, निजी और ऑफ़लाइन फ़ोटो कंप्रेशन।',
  },
  select: {
    heading: 'फ़ोटो चुनें',
    intro:
      'सारी प्रोसेसिंग इसी डिवाइस पर होती है — कुछ भी अपलोड नहीं होता, कभी नहीं। एक फ़ोटो जोड़ें या एक साथ कई फ़ोटो जोड़ें।',
    addImages: 'इमेज जोड़ें',
    dropTitle: 'इमेज को यहाँ खींचकर छोड़ें',
    dropOr: 'या',
    dropBrowse: 'अपनी फ़ाइलें चुनें',
    dropFormats: '— JPEG, PNG, WebP और अन्य',
    skippedOne: '{count} फ़ाइल को इमेज के रूप में पढ़ा नहीं जा सका, इसलिए उसे छोड़ दिया गया: {names}',
    skippedMany: '{count} फ़ाइलें इमेज के रूप में पढ़ी नहीं जा सकीं, इसलिए उन्हें छोड़ दिया गया: {names}',
    remove: '{name} हटाएँ',
    selectedOne: '{count} फ़ोटो · कुल {total}',
    selectedMany: '{count} फ़ोटो · कुल {total}',
    clearAll: 'सभी हटाएँ',
    continue: 'आगे बढ़ें',
  },
  target: {
    heading: 'कंप्रेशन सेटिंग्स',
    appliedOne: 'ये सेटिंग्स चुनी हुई फ़ोटो पर लागू होंगी।',
    appliedMany: 'ये सेटिंग्स चुनी हुई सभी {count} फ़ोटो पर लागू होंगी।',
    modeAria: 'कंप्रेशन मोड',
    tabs: {
      target: 'लक्ष्य आकार',
      quality: 'गुणवत्ता',
      resize: 'आकार बदलें',
    },
    help: {
      target:
        'Fotmio वह सबसे अच्छी गुणवत्ता ढूँढता है जो आपके लक्ष्य आकार में फिट हो जाए — ऑनलाइन फ़ॉर्म और पोर्टल की KB सीमा के लिए यही सेटिंग चाहिए।',
      quality:
        'हर फ़ोटो के लिए एक ही गुणवत्ता स्तर। स्तर जितना ऊँचा, फ़ोटो मूल के उतनी पास; जितना नीचा, फ़ाइल उतनी छोटी।',
      maxDimension: 'बड़ी फ़ोटो को अधिकतम चौड़ाई और ऊँचाई तक छोटा करें। फ़ोटो को कभी बड़ा नहीं किया जाता।',
    },
    targetSize: 'लक्ष्य आकार',
    customSize: 'अपना आकार',
    kb: 'KB',
    maxWidth: 'अधिकतम चौड़ाई (px)',
    maxHeight: 'अधिकतम ऊँचाई (px)',
    noLimit: 'कोई सीमा नहीं',
    quality: 'गुणवत्ता',
    qualityCap: 'गुणवत्ता की ऊपरी सीमा',
    smallerFile: 'छोटी फ़ाइल',
    betterQuality: 'बेहतर गुणवत्ता',
    outputFormat: 'आउटपुट फ़ॉर्मेट',
    sameAsOriginal: 'मूल फ़ॉर्मेट जैसा ही',
    formatHelp: {
      same: 'हर फ़ोटो उसी फ़ॉर्मेट में रहती है जिसमें वह पहले से है।',
      jpeg: 'हर जगह चलने वाला सबसे भरोसेमंद विकल्प। पारदर्शिता नीचे चुने गए पृष्ठभूमि रंग पर समतल हो जाती है।',
      webp: 'उसी गुणवत्ता पर आमतौर पर JPEG से छोटा, और सभी आधुनिक ब्राउज़र व ऐप में समर्थित।',
      png: 'बिना गुणवत्ता घटाए, इसलिए फ़ाइलें बड़ी रहती हैं। ग्राफ़िक्स और स्क्रीनशॉट के लिए बेहतर; फ़ोटो का लक्ष्य आकार ज़रूरत पड़ने पर आकार घटाकर पूरा किया जाता है।',
    },
    backgroundFill: 'पृष्ठभूमि रंग',
    backgroundHexAria: 'पृष्ठभूमि रंग का हेक्स मान',
    backgroundHelp: 'जब फ़ोटो बिना पारदर्शिता के सहेजी जाती है, तो पारदर्शी हिस्सों में यह रंग भरता है।',
    stripTitle: 'मेटाडेटा हटाएँ (EXIF और GPS)',
    stripHelp: 'कंप्रेस की गई फ़ाइलों से स्थान और कैमरा विवरण हटा देता है। अनुशंसित है।',
    back: 'वापस',
    compressing: 'कंप्रेस हो रहा है…',
    compressOne: '{count} फ़ोटो कंप्रेस करें',
    compressMany: '{count} फ़ोटो कंप्रेस करें',
    progress: '{total} में से {current} कंप्रेस हो रही है — {name}',
  },
  results: {
    heading: 'परिणाम',
    summaryOne: '{count} फ़ोटो कंप्रेस हुई: {original} → {output} · {savings}',
    summaryMany: '{count} फ़ोटो कंप्रेस हुईं: {original} → {output} · {savings}',
    smaller: '{percent} कम आकार',
    larger: '{percent} बड़ा आकार',
    sameSize: 'आकार समान',
    noneCompressed: 'कोई फ़ोटो कंप्रेस नहीं हुई — नीचे दी गई समस्याएँ देखें।',
    failedHeadingOne: '{count} फ़ाइल कंप्रेस नहीं हो सकी',
    failedHeadingMany: '{count} फ़ाइलें कंप्रेस नहीं हो सकीं',
    backToSettings: 'सेटिंग्स पर वापस जाएँ',
    compressMore: 'और फ़ोटो कंप्रेस करें',
  },
  resultCard: {
    rustEngine: 'Rust इंजन',
    browserEngine: 'ब्राउज़र इंजन',
    rustEngineTitle: 'Rust/WASM इंजन से कंप्रेस किया गया',
    browserEngineTitle: 'अंतर्निर्मित ब्राउज़र फ़ॉलबैक इंजन से कंप्रेस किया गया',
    previewVersion: 'पूर्वावलोकन संस्करण',
    before: 'पहले',
    after: 'बाद में',
    compressedAlt: '{name} का कंप्रेस किया गया संस्करण',
    originalAlt: '{name} का मूल संस्करण',
    targetNotMet:
      'इन सेटिंग्स पर लक्ष्य आकार पूरा नहीं हो सका — इस फ़ोटो के लिए Fotmio इससे छोटी फ़ाइल नहीं बना सका।',
    format: 'फ़ॉर्मेट',
    dimensions: 'आयाम',
    qualityUsed: 'गुणवत्ता',
    lossless: 'लॉसलेस',
    was: '(पहले {dimensions})',
    download: 'डाउनलोड करें',
  },
}

export default hiIN
