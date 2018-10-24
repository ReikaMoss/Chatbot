var oTPStats = {
  urlRules: [],
  gtmIdList: new Array('GTM-KX5M', 'GTM-TJFLCX', 'GTM-ZPRB', 'GTM-L75F', 'GTM-FDZ4', 'GTM-537GKQ'),
  gtmFound: false,
  gtmId: ''
};

oTPStats.gtmFound = 'undefined' !== typeof google_tag_manager;

if (!oTPStats.gtmFound) {

  if (_tpi_location.host.contains("autogestion.personal.com.ar")) {
    oTPStats.gtmId = 'GTM-537GKQ';
  } else if (_tpi_location.host.contains("club.personal.com.ar") || _tpi_location.host.contains("turegalo.personal.com.ar")) {
    oTPStats.gtmId = 'GTM-TJFLCX';
  } else if (_tpi_location.host.contains("video.personal.com.ar") || _tpi_location.host.contains("musica.personal.com.ar") || _tpi_location.host.contains("juegos.personal.com.ar") || _tpi_location.host.contains("revistas.personal.com.ar") || _tpi_location.host.contains("deportes.personal.com.ar") || _tpi_location.host.contains("deportes.personal.com.ar") || _tpi_location.host.contains("play.personal.com.ar") || _tpi_location.host.contains("sms.personal.com.ar") || _tpi_location.host.contains("sms1.personal.com.ar") || _tpi_location.host.contains("sms2.personal.com.ar") || _tpi_location.host.contains("sms3.personal.com.ar") || _tpi_location.host.contains("sms4.personal.com.ar") || _tpi_location.host.contains("educa.personal.com.ar") || _tpi_location.host.contains("arnetplay.com.ar")) {
    oTPStats.gtmId = 'GTM-ZPRB';
  } else if (_tpi_location.host.contains("www.personal.com.ar") || _tpi_location.host == "personal.com.ar") {
    oTPStats.gtmId = 'GTM-KX5M';
  } else if (_tpi_location.host.contains("personal.com.ar")) {
    oTPStats.gtmId = 'GTM-M29PB7';
  }/* else if (_tpi_location.host.contains("arnet.com.ar")) {
    oTPStats.gtmId = 'GTM-L75F';
  }*/ else if (_tpi_location.host.contains("telecom.com.ar")) {
    oTPStats.gtmId = 'GTM-FDZ4';
  }

  if (oTPStats.gtmId != '') {
    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = '//www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', oTPStats.gtmId);
  }

} else {

  if (_tpi_location.host.contains("video.personal.com.ar")) {
    (function(w, d, s, l, i) {
      w[l] = w[l] || [];
      w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
      var f = d.getElementsByTagName(s)[0],
        j = d.createElement(s),
        dl = l != 'dataLayer' ? '&l=' + l : '';
      j.async = true;
      j.src = '//www.googletagmanager.com/gtm.js?id=' + i + dl;
      f.parentNode.insertBefore(j, f);
    })(window, document, 'script', 'dataLayer', 'GTM-ZPRB');
  }

}
