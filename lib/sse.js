/**
 * @name SSE hook
 * @desc sails hook to add .sse(); method on res object
 * @author faouzane
 */

 module.exports = SSE;


 function SSE(req, res, next) {

  // YOU CAN SEND AN EVENT AND SOME DATA OR JUST SOME DATA
  res.sse = function (eventObject, options) {
    console.log(('[SSE] EVENT ' + eventObject).cyan);
    var options = options || {};

    if(!res.headersSent){
      console.log(('[SSE] EVENT HEADER SENT').cyan);
      res.type("text/event-stream");
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      });

      var padding = new Array(2049);
      res.write(":" + padding.join(" ") + "\n"); // 2kB padding for IE
      res.write("retry: " + ( options.retry || 200 )+ "\n");
    }

res.flush();

    if (_.isString(eventObject)) {
      res.write('data: '+ eventObject + '\n\n');
      console.log(('data: '+ eventObject + '\n\n').cyan);
      res.flush();

    }
    else if (_.isObject(eventObject)) {
      if(eventObject.id){
        res.write('id: '+ eventObject.id + '\n');
        console.log(('id: '+ eventObject.id ).cyan);
      }
      if(eventObject.event){
        res.write('event: '+ eventObject.event + '\n');
        console.log(('event: '+ eventObject.event ).cyan);
      }

      if(eventObject.data){
       // console.log(('data: '+ JSON.stringify(eventObject.data).substring(0,100)).cyan);
        res.write('data: '+  JSON.stringify(eventObject.data)  + '\n\n');
      }

      console.log('FLUSHING'.yellow);
      res.flush();
      res.flush();
    }
  };


  // End stream connexion. The 100ms delay helps with allowing the current transfer to complete
  res.closeSse = function(){
    console.log("[SSE] sending closing request");
    setTimeout(function(){
      res.sse({id:'CLOSE'});// send a close id to tell the client it should close the connexion
    },100);
  };

  return next();
}



