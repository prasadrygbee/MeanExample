var meanNews = angular.module('meanNews', []);

/**--------------------------------------------------------------
 * [configuration for meannews angular app]
 * @param  {[object]} $httpProvider [angular httpprovider]
 * --------------------------------------------------------------
 */
meanNews.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
}]);

/**--------------------------------------------------------------
 * [main controller for the angular app]
 * @param  {[object]}         $scope      [mainController scope]
 * @param  {[angularService]} postFactory [service which interacts with mongodb]
 * --------------------------------------------------------------
 */
meanNews.controller('MainCtrl', ['$scope','postFactory',function($scope,postFactory){

  /**-----------------------
   * [onLoad description]
   * -----------------------
   */
  $scope.onLoad = function() {
    var url = 'http://localhost:3000/posts';
    postFactory.getData(url,$scope);
  }

  /**-----------------------
   * [addPost description]
   * -----------------------
   */
	$scope.addPost = function(){
    var url =  'http://localhost:3000/newpost'
		var newPostData;
    if($scope.postname === '') { return; }

    if($scope.postlink != undefined) {
      newPostData = {
        post      : $scope.postname,
        upvotes   : 0,
        link      : $scope.postlink
      };
    } else {
      newPostData = {
        post     : $scope.postname,
        upvotes  : 0
      };
    }
    
    var postDataJSON = JSON.stringify(newPostData);
    
    postFactory.addPost(url,postDataJSON,$scope,$scope.onLoad)
  
    $scope.postname = '';
	};

  /**--------------------------
   * [removePost description]
   * --------------------------
   */
  $scope.removePost = function(post){
    var url =  'http://localhost:3000/removepost'

    var removePostData;

    if(post.link != undefined) {
      removePostData = {
        post      : post.post,
        upvotes   : post.upvotes,
        link      : post.link
      };
    } else {
      removePostData = {
        post     : post.post,
        upvotes  : post.upvotes
      };
    }

    var postDataJSON = JSON.stringify(removePostData);
    
    postFactory.removePost(url,postDataJSON,$scope,$scope.onLoad)
  
    $scope.postname = '';
  };

  /**----------------------------
   * [likePost description]
   * @param  {[type]} post [description]
   * ----------------------------
   */
  $scope.likePost = function(post) {
    $scope.currPost = post;
    
    var oldPost = {
      "post"    : post.post,
      "upvotes" : post.upvotes
    };

    post.upvotes += 1;

    var newPost = {
      "post"    : post.post,
      "upvotes" : post.upvotes
    };

    var url =  'http://localhost:3000/updatepost'

    postFactory.updatePost(url,newPost,oldPost,$scope,$scope.onLoad)
  };

  $scope.addLinkToPost = function(post,currPostLink) {
    if(currPostLink != undefined) {
      var oldPost = {
        "post"    : post.post,
        "upvotes" : post.upvotes
      };

      var newPost = {
        "post"    : post.post,
        "upvotes" : post.upvotes,
        "link"    : currPostLink
      };


      var url =  'http://localhost:3000/updatepost'
      postFactory.updatePost(url,newPost,oldPost,$scope,$scope.onLoad)
    }
  }

  /*var socket = io();
  socket.on("updateMessage",function(msg){
    $scope.onLoad();
  });*/

  $scope.onLoad('http://localhost:3000', {'forceNew':true });
}]);

/**-----------------------------------------------------------------------------------------
 * [angular factory which will get and post data to Express-NodeJs web server to get data from mongodb]
 * @param  {[type]} $http          [protocol to communicate with webserver]
 * @param  {[type]} $templateCache [angular template cache]
 * -----------------------------------------------------------------------------------------
 */
meanNews.factory('postFactory', ['$http','$templateCache',function($http,$templateCache){
  return {
      /**----------------------------------------------------------------
       * [getData will get the data from webserver]
       * @param  {[string]} url   [url to get data from]
       * @param  {[object]} scope [calling controllers scope]
       * ----------------------------------------------------------------
       */
      getData : function(url,scope) {
        $http.get(url).success(function(data) {
          scope.posts = data
        });
      },

      /**----------------------------------------------------------------
       * [addPost will indicate webserver to add post to mongodb]
       * @param  {[string]} inseturl    [url to post data to]
       * @param  {[string]} json        [data to be added to database]
       * @param  {[object]} scope       [calling controllers scope]
       * @param  {[function]} callback  [on sucess call this function]
       * ----------------------------------------------------------------
       */
      addPost : function(inseturl,json,scope,callback) {
          var response;
          var self = this;
          $http({
            method  : "POST",
            url     : inseturl,
            data    : 'mydata='+json,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'},
            cache   : $templateCache
          }).success(function(res){
             callback();
          }).error(function(res){
            alert("Error occured while adding post")
          });
      },

      /**----------------------------------------------------------------
       * [removePost will indicate webserver to add post to mongodb]
       * @param  {[string]} inseturl    [url to post data to]
       * @param  {[string]} json        [data to be added to database]
       * @param  {[object]} scope       [calling controllers scope]
       * @param  {[function]} callback  [on sucess call this function]
       * ----------------------------------------------------------------
       */
      removePost : function(removeurl,json,scope,callback) {
          var response;
          var self = this;
          $http({
            method  : "POST",
            url     : removeurl,
            data    : 'mydata='+json,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'},
            cache   : $templateCache
          }).success(function(res){
             callback();
          }).error(function(res){
            alert("Error occured while removing post")
          });
      },

      /**----------------------------------------------------------------
       * [updatePost description]
       * @param  {[string]} inseturl [url to post data to]
       * @param  {[object]} newPost  [new database object to be inserted]
       * @param  {[object]} oldPost  [old database object to be modified]
       * @param  {[object]} scope    [calling controllers scope]
       * @param  {Function} callback [on sucess call this function]
       * ----------------------------------------------------------------
       */
      updatePost : function(inseturl,newPost,oldPost,scope,callback) {
          var response;
          var self = this;
          var oldnewdata = [];
          oldnewdata.push({"newData" : newPost});
          oldnewdata.push({"oldData" : oldPost});

          var oldnewdataJSON = JSON.stringify(oldnewdata);

          $http({
            method  : "POST",
            url     : inseturl,
            data    : 'mydata='+oldnewdataJSON,
            headers : {'Content-Type': 'application/x-www-form-urlencoded'},
            cache   : $templateCache
          }).success(function(res){
             callback();
          }).error(function(res){
            alert("Error occured while updating post")
          });
      }
    }
}]);

