<script lang="ts">
    import Github from "~icons/mdi/github?raw&width=100%25&height=100%25";

    import OutwardIcon from "@/components/outward-icon.svelte";
    import * as Tooltip from "@/components/ui/tooltip";
    import { Button } from "@/components/ui/button";
</script>

<p class="text-xs text-muted-foreground mt-4">
    <b>
        Copyright &#169; {new Date().getFullYear()} Ethan Standafer. All rights reserved.
    </b>
    Contact me at ethanstandafer [at] gmail [dot] com. (doing this to avoid email
    scrapers)
</p>

<div class="w-full flex mt-4">
    <Tooltip.Root openDelay={0}>
        <Tooltip.Trigger>
            <Button
                class="text-xs text-muted-foreground"
                variant="link"
                href="https://github.com/standafer/scc-utils"
                target="_blank"
            >
                <span class="mr-2 h-full">
                    {@html Github}
                </span>
                Source Code
                <span class="ml-2 h-full">
                    <OutwardIcon />
                </span>
            </Button>
        </Tooltip.Trigger>
        <Tooltip.Content>
            <p>This is an external link to the GitHub repository</p>
        </Tooltip.Content>
    </Tooltip.Root>
</div>
