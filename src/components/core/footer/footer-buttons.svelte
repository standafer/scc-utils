<script lang="ts">
    import PartyPopper from "~icons/fluent-emoji-flat/party-popper?raw&width=100%25&height=100%25";
    import Heart from "~icons/fluent-emoji-flat/sparkling-heart?raw&width=100%25&height=100%25";

    import { Button } from "@/components/ui/button";
    import * as Dialog from "@/components/ui/dialog";
    import FooterDialog from "@/components/core/footer/footer-dialog.svelte";

    let tab: "donate" | "changelog" = "donate";
</script>

<Dialog.Root>
    <Dialog.Trigger>
        <Button
            on:click={() => {
                tab = "donate";
            }}
        >
            <span class="mr-2 h-[100%]">
                {@html Heart}
            </span>
            Donate
        </Button>
        <Button
            variant="secondary"
            on:click={() => {
                tab = "changelog";
            }}
        >
            <span class="mr-2 h-[100%]">
                {@html PartyPopper}
            </span>
            Changelog
        </Button>
    </Dialog.Trigger>
    <FooterDialog {tab} />
</Dialog.Root>
