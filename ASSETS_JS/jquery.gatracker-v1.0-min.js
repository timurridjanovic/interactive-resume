/* •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
   ••  Project: jQuery Google Analytics Tracker                     ••
   ••  Author:  delarueguillaume@gmail.com                          ••
   ••  WebSite : http://www.web2ajax.fr/                            ••
   ••  Date:    2010                                                ••
   ••  Version: 1.0 (05 march 2010)                                 ••
   •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••   
   
    Defer Google Analytics Tracking and can track a page with just 
    a call to the plugin.
    
    More informations on : 
    http://www.web2ajax.fr/2010/06/10/defer-google-analytics-tracking-jquery-gatracker
    
---------------------------------------------------------------------- */
(function($){$.gaTracker={code:false,log:function(t){if(typeof console!='undefined'){console.log(t);}},track:function(url){var self=this;if(self.code){var pageTracker=_gat._getTracker(self.code);if(typeof url!='undefined'){self.log('Tracking GA : '+url);pageTracker._trackPageview(url);}else{self.log('Tracking GA : current page');pageTracker._trackPageview();}}else{self.log('Google Analytics Tracker is not ready');}},init:function(code){var self=this;self.log('Init Async GA');if(typeof code!='undefined'&&this.code===false)this.code=code;if(!this.code)log('Google Analytics UA must be entered');else{try{var gaURL=(location.href.indexOf('https')==0?'https://ssl':'http://www');gaURL+='.google-analytics.com/ga.js';$.getScript(gaURL,function(){self.track();});}catch(err){self.log('Failed to load Google Analytics:'+err);}}}};})(jQuery);