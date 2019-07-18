<template>
  <div class="search">
    <!--搜索框-->
    <div class="search-box-wrapper">
      <search-box></search-box>
    </div>
    <div>
      <base-scroll>
        <div>
          <!--热门搜索-->
          <div class="hot-key"></div>
          <!--搜索历史-->
          <div class="search-history"></div>
        </div>
      </base-scroll>
    </div>
    <!--搜索结果-->
    <div class="search-result"></div>
  </div>
</template>

<script>
import SearchBox from 'base/search-box/search-box'
import BaseScroll from 'base/scroll/scroll'
export default {
  name: 'Search',
  components: {
    SearchBox,
    BaseScroll
  }
}
</script>

<style lang="stylus" scoped>

</style>
