<script lang="ts">
    import * as Dialog from "@/components/ui/dialog";
</script>

<Dialog.Header
    class="absolute bg-background/90 w-full py-8 backdrop-blur-md px-8 z-50 sm:rounded-t-lg"
>
    <Dialog.Title class="h-[24px] flex items-center">
        <slot name="title" />
    </Dialog.Title>
</Dialog.Header>

<Dialog.Description class="px-8 py-8 pt-20 mb-10">
    <slot name="root" />
</Dialog.Description>
