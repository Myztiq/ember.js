import DAG from "ember-application/system/dag";
import EmberError from "ember-metal/error";

QUnit.module("Ember.DAG");

test("detects circular dependencies when added", function(){
  var graph = new DAG();
  graph.addEdges("eat omelette", 1);
  graph.addEdges("buy eggs", 2) ;
  graph.addEdges("fry omelette", 3, "eat omelette", "shake eggs");
  graph.addEdges("shake eggs", 4, undefined, "buy eggs");
  graph.addEdges("buy oil", 5, "fry omelette");
  graph.addEdges("warm oil", 6, "fry omelette", "buy oil");
  graph.addEdges("prepare salad", 7);
  graph.addEdges("prepare the table", 8, "eat omelette");
  graph.addEdges("clear the table", 9, undefined, "eat omelette");
  graph.addEdges("say grace", 10, "eat omelette", "prepare the table");

  raises(function(){
    graph.addEdges("imposible", 11, "shake eggs", "eat omelette");
  }, EmberError, "raises an error when a circular dependency is added");
});

test("#topsort iterates over the edges respecting precedence order", function(){
  var graph = new DAG();
  var names = [];
  var index = 0;

  graph.addEdges("eat omelette", 1);
  graph.addEdges("buy eggs", 2) ;
  graph.addEdges("fry omelette", 3, "eat omelette", "shake eggs");
  graph.addEdges("shake eggs", 4, undefined, "buy eggs");
  graph.addEdges("buy oil", 5, "fry omelette");
  graph.addEdges("warm oil", 6, "fry omelette", "buy oil");
  graph.addEdges("prepare salad", 7);
  graph.addEdges("prepare the table", 8, "eat omelette");
  graph.addEdges("clear the table", 9, undefined, "eat omelette");
  graph.addEdges("say grace", 10, "eat omelette", "prepare the table");


  graph.topsort(function(vertex, path){
    names[index] = vertex.name;
    index++;
  });

  ok(names.indexOf("buy eggs") < names.indexOf("shake eggs"), "you need eggs to shake them");
  ok(names.indexOf("buy oil") < names.indexOf("warm oil"), "you need oil to warm it");
  ok(names.indexOf("eat omelette") < names.indexOf("clear the table"), "you clear the table after eat");
  ok(names.indexOf("fry omelette") < names.indexOf("eat omelette"), "cook before eat");
  ok(names.indexOf("shake eggs") < names.indexOf("fry omelette"), "shake before put into the pan");
  ok(names.indexOf("prepare salad") > -1, "we don't know when we prepare the salad, but we do");
});

test("#addEdged supports both strings and arrays to specify precedences", function(){
  var graph = new DAG();
  var names = [];
  var index = 0;

  graph.addEdges("eat omelette", 1);
  graph.addEdges("buy eggs", 2) ;
  graph.addEdges("fry omelette", 3, "eat omelette", "shake eggs");
  graph.addEdges("shake eggs", 4, undefined, "buy eggs");
  graph.addEdges("buy oil", 5, ["fry omelette", "shake eggs", "prepare the table"], ["warm oil"]);
  graph.addEdges("prepare the table", 5, undefined, ["fry omelette"]);

  graph.topsort(function(vertex, path){
    names[index] = vertex.name;
    index++;
  });

  deepEqual(names, ["buy eggs", "warm oil", "buy oil", "shake eggs", "fry omelette", "eat omelette", "prepare the table"]);
});

