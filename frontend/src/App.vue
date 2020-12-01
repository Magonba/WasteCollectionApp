<template>
  <div id="app">
    <h1>Waste Collection App</h1>
    <ul>
      <li v-for="item in Projects" :key="item.id">
        <project :project="item">
        </project>
      </li>
    </ul>
  </div>
</template>

<script>
import Project from './components/Project.vue';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    Project
  },
  data(){
    return {
      Projects: null
    }
  },
  created: function() {
    axios.get("http://localhost:3000/projects/").then(res => {
        this.Projects = res.data;
        console.log(this.Projects)
      })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
