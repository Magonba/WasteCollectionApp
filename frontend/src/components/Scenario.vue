<template>
    <div>
        {{scenario.title}}
        <button type="button" class="btn">
            Edit
        </button>
    </div>
</template>

<script>
export default {
    props: {
        scenario: {
            required: true,
            type: Object
        }
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
