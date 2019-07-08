<template>
  <div class="m-header">
    <!--音乐app图标-->
    <div class="icon"></div>
    <!--音乐app标题-->
    <h1 class="text">Chicken Music</h1>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
}
</script>

<style lang="stylus" rel="stylesheet/stylus" scoped>
  @import '~common/stylus/variable'
  @import '~common/stylus/mixin'

  .m-header
    position: relative
    height: 44px
    text-align: center
    color: $color-theme
    font-size: 0
    .icon
      display: inline-block
      vertical-align: top
      margin-top: 6px
      margin-right: 9px
      width: 30px
      height: 32px
      bg-image('logo')
      background-size: 30px 32px
    .text
      display: inline-block
      line-height: 44px
      vertical-align: top
      font-size: $font-size-large

</style>
