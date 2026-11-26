<?php
/**
 * Plugin Name: Praanavaidya – rebuild main site on publish
 * Description: When a post is published, updated, unpublished or deleted on this blog, tell the
 *              main site's host (Netlify / Vercel / Cloudflare Pages) to rebuild, so the change
 *              appears on praanavaidya.com within a couple of minutes.
 * Version:     1.1
 *
 * INSTALL (on blog.praanavaidya.com, Hostinger):
 *   1. hPanel > File Manager > public_html/wp-content/ : create a folder "mu-plugins" if it is
 *      missing, and upload this file into it. Must-use plugins are always active.
 *   2. Edit public_html/wp-config.php and add, above "That's all, stop editing!":
 *        define( 'PV_BUILD_HOOK_URL', 'https://...your build hook URL...' );
 *   3. Publish or update a post. The main site starts rebuilding straight away.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/** Rebuild whenever a post goes live, changes while live, or stops being live. */
add_action(
	'transition_post_status',
	function ( $new_status, $old_status, $post ) {
		if ( 'post' !== $post->post_type || wp_is_post_revision( $post ) || wp_is_post_autosave( $post ) ) {
			return;
		}
		if ( 'publish' !== $new_status && 'publish' !== $old_status ) {
			return; // drafts and pending posts never reach the main site
		}
		pv_trigger_site_rebuild();
	},
	10,
	3
);

add_action(
	'before_delete_post',
	function ( $post_id ) {
		$post = get_post( $post_id );
		if ( $post && 'post' === $post->post_type && 'publish' === $post->post_status ) {
			pv_trigger_site_rebuild();
		}
	}
);

/**
 * Call the build hook right away (no waiting for WP-Cron, which on Hostinger only runs when
 * someone visits the blog). The block editor saves a post twice, so ignore repeats within 15s;
 * the host queues builds, so a later edit still gets its own rebuild.
 */
function pv_trigger_site_rebuild() {
	if ( ! defined( 'PV_BUILD_HOOK_URL' ) || ! PV_BUILD_HOOK_URL ) {
		error_log( 'Praanavaidya rebuild hook: PV_BUILD_HOOK_URL is not set in wp-config.php' );
		return;
	}
	if ( get_transient( 'pv_rebuild_lock' ) ) {
		return;
	}
	set_transient( 'pv_rebuild_lock', 1, 15 );

	$response = wp_remote_post(
		PV_BUILD_HOOK_URL,
		array(
			'timeout'  => 10,
			'blocking' => true,
			'headers'  => array( 'Content-Type' => 'application/json' ),
			'body'     => '{}',
		)
	);
	if ( is_wp_error( $response ) ) {
		error_log( 'Praanavaidya rebuild hook failed: ' . $response->get_error_message() );
		delete_transient( 'pv_rebuild_lock' );
	} elseif ( wp_remote_retrieve_response_code( $response ) >= 300 ) {
		error_log( 'Praanavaidya rebuild hook returned HTTP ' . wp_remote_retrieve_response_code( $response ) );
		delete_transient( 'pv_rebuild_lock' );
	}
}
